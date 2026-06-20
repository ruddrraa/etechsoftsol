import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Upload } from "@/models/Upload";
import { ReportRecord } from "@/models/ReportRecord";
import { uploadFileToR2, generateR2Key } from "@/lib/r2";
import Papa from "papaparse";
import * as xlsx from "xlsx";
import crypto from "crypto";
import { logAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
// ... keep existing GET untouched ...
  try {
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    await connectDB();

    const [uploads, total] = await Promise.all([
      Upload.find({ tenantId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("uploadedBy", "name userId")
        .lean(),
      Upload.countDocuments({ tenantId }),
    ]);

    return NextResponse.json({
      uploads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[Uploads GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const actorId = request.headers.get("x-user-id");
    const actorRole = request.headers.get("x-user-role");

    if (!tenantId || !actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Enforce Daily Upload Limit for standard users
    if (actorRole !== "HOSPITAL_ADMIN") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const existingUpload = await Upload.findOne({ tenantId, createdAt: { $gte: startOfDay } });
      if (existingUpload) {
        return NextResponse.json(
          { error: "Daily upload limit reached. Only Hospital Admins can upload multiple reports per day." },
          { status: 403 }
        );
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isCsv = file.name.endsWith(".csv") || file.type === "text/csv";
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.type.includes("spreadsheetml") || file.type.includes("excel");

    if (!isCsv && !isExcel) {
      return NextResponse.json({ error: "Only CSV and Excel files are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const r2Key = generateR2Key(tenantId, file.name);

    // 2. Upload to R2
    let uploadedKey = "";
    try {
      if (process.env.R2_ACCOUNT_ID) {
        uploadedKey = await uploadFileToR2(r2Key, buffer, file.type);
      } else {
        uploadedKey = "r2-not-configured/" + file.name;
      }
    } catch (e) {
      console.error("R2 Upload failed, continuing with mock key for demo", e);
      uploadedKey = "r2-failed/" + file.name;
    }

    // 3. Parse file
    let rows: any[] = [];
    if (isCsv) {
      const csvString = buffer.toString("utf-8");
      const parseResult = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      rows = parseResult.data as any[];
    } else if (isExcel) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = xlsx.utils.sheet_to_json(worksheet, { raw: false }) as any[];
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // 4. Schema Detection
    const detectedFields: Array<{ name: string; type: "number" | "date" | "category" | "string" }> = [];
    if (rows.length > 0) {
      const firstRow = rows[0];
      for (const key of Object.keys(firstRow)) {
        const val = firstRow[key];
        let type: "number" | "date" | "category" | "string" = "string";
        if (typeof val === "number" || !isNaN(Number(val))) {
          type = "number";
        } else if (typeof val === "string") {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes("date") || lowerKey.includes("time") || !isNaN(Date.parse(val))) {
            type = "date";
          } else {
            type = "category"; // Default to category for string columns to enable distribution charts
          }
        }
        detectedFields.push({ name: key, type });
      }
    }

    // 5. Create Upload Record
    const upload = await Upload.create({
      tenantId,
      uploadedBy: actorId,
      fileName: file.name,
      fileType: "csv",
      fileSizeBytes: file.size,
      r2Key: uploadedKey,
      r2Url: uploadedKey,
      status: "importing",
      validation: {
        rowCount: rows.length,
        departments: [],
        errors: [],
        warnings: [],
        duplicateCount: 0,
      },
      fileSchema: {
        fields: detectedFields
      }
    });

    // 6. Process Rows & Insert to MongoDB
    let inserted = 0;
    let skipped = 0;
    const recordsToInsert = [];
    const parseErrors: string[] = [];

    // Identify the primary date field if it exists
    const dateField = detectedFields.find(f => f.type === "date")?.name;

    for (const [index, row] of rows.entries()) {
      try {
        // Sanitize row values (e.g., parse numbers)
        const sanitizedData: Record<string, any> = {};
        for (const field of detectedFields) {
          if (field.type === "number") {
            sanitizedData[field.name] = parseFloat(String(row[field.name] || "0"));
          } else {
            sanitizedData[field.name] = row[field.name];
          }
        }

        const reportDateRaw = dateField ? row[dateField] : new Date().toISOString();
        let parsedDate = new Date(reportDateRaw);
        if (isNaN(parsedDate.getTime())) {
          const parts = String(reportDateRaw).split('/');
          if (parts.length === 3) {
            parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        if (isNaN(parsedDate.getTime())) {
          parsedDate = new Date(); // Fallback
        }

        const contentHash = crypto
          .createHash("sha256")
          .update(`${tenantId}-${JSON.stringify(sanitizedData)}`)
          .digest("hex");

        recordsToInsert.push({
          tenantId,
          uploadId: upload._id,
          reportDate: parsedDate,
          data: sanitizedData,
          contentHash,
        });
      } catch (e: any) {
        skipped++;
        parseErrors.push(`Row ${index}: ${e.message}`);
      }
    }

    let bulkWriteError = null;

    if (recordsToInsert.length > 0) {
      try {
        const result = await ReportRecord.insertMany(recordsToInsert, { ordered: false });
        inserted = result.length;
      } catch (error: any) {
        if (error.code === 11000 && error.insertedDocs) {
          inserted = error.insertedDocs.length;
          skipped += (recordsToInsert.length - inserted);
          bulkWriteError = "Some rows skipped as duplicates.";
        } else {
          console.error("InsertMany failed:", error);
          upload.status = "failed";
          upload.validation.errors.push("Database insertion failed: " + error.message);
          await upload.save();
          return NextResponse.json({ error: "Failed to process records: " + error.message }, { status: 500 });
        }
      }
    }

    upload.status = "completed";
    upload.importStats = { inserted, skipped, updated: 0 };
    if (parseErrors.length > 0) upload.validation.warnings.push(...parseErrors);
    if (bulkWriteError) upload.validation.warnings.push(bulkWriteError);
    upload.completedAt = new Date();
    await upload.save();

    await logAction({
      actorId,
      actorRole: actorRole ?? "HOSPITAL_ADMIN",
      tenantId,
      action: "REPORT_UPLOAD",
      resource: "Upload",
      resourceId: upload._id.toString(),
      metadata: { fileName: file.name, inserted, skipped },
    });

    return NextResponse.json({
      success: true,
      upload: {
        id: upload._id,
        fileName: upload.fileName,
        status: upload.status,
        stats: upload.importStats,
        warnings: upload.validation.warnings,
      },
    });
  } catch (err) {
    console.error("[Uploads POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
