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

    await connectDB();

    const buffer = Buffer.from(await file.arrayBuffer());
    const r2Key = generateR2Key(tenantId, file.name);

    // 1. Upload to R2
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

    // 2. Parse file
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

    // 3. Create Upload Record
    const upload = await Upload.create({
      tenantId,
      uploadedBy: actorId,
      fileName: file.name,
      fileType: "csv",
      fileSizeBytes: file.size,
      r2Key: uploadedKey,
      r2Url: uploadedKey, // We never store the public URL, just the key
      status: "importing",
      validation: {
        rowCount: rows.length,
        departments: [],
        errors: [],
        warnings: [],
        duplicateCount: 0,
      },
    });

    // 4. Process Rows & Insert to MongoDB
    let inserted = 0;
    let skipped = 0;
    const departments = new Set<string>();

    const recordsToInsert = [];
    const parseErrors: string[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        // Map headers. We expect either Patient-level data or Aggregated data.
        const department = row["Department"] || row["department"] || "General";
        const reportDateRaw = row["Report Date"] || row["Report_Date"] || row["reportDate"] || row["report_date"] || new Date().toISOString();
        
        // Aggregated fields
        const totalCountRaw = row["Total_Count"] || row["totalCount"] || row["Total Count"];
        const maleCountRaw = row["Male_Count"] || row["maleCount"] || row["Male Count"];
        const femaleCountRaw = row["Female_Count"] || row["femaleCount"] || row["Female Count"];

        // Patient level fields
        const patientIdRaw = row["Patient ID"] || row["patientId"] || row["patient_id"];
        const patientName = row["Patient Name"] || row["patientName"] || row["patient_name"];
        const revenueRaw = row["Revenue"] || row["revenue"];
        const status = row["Status"] || row["status"] || "completed";

        const totalCount = totalCountRaw ? parseInt(String(totalCountRaw), 10) : 1;
        const maleCount = maleCountRaw ? parseInt(String(maleCountRaw), 10) : 0;
        const femaleCount = femaleCountRaw ? parseInt(String(femaleCountRaw), 10) : 0;
        const revenue = parseFloat(String(revenueRaw || "0"));
        
        const departmentStr = String(department);

        // If we don't have a patient ID but we have aggregated data, we generate a hash based ID for the category
        const patientId = patientIdRaw || `AGG-${departmentStr.substring(0,3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

        departments.add(departmentStr);

        const contentHash = crypto
          .createHash("sha256")
          .update(`${tenantId}-${patientId}-${reportDateRaw}-${departmentStr}-${revenue}-${totalCount}`)
          .digest("hex");

        let parsedDate = new Date(reportDateRaw);
        if (isNaN(parsedDate.getTime())) {
          // Attempt parsing DD/MM/YYYY
          const parts = String(reportDateRaw).split('/');
          if (parts.length === 3) {
            parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date format for: ${reportDateRaw}`);
        }

        recordsToInsert.push({
          tenantId,
          uploadId: upload._id,
          reportDate: parsedDate,
          patientId: String(patientId),
          patientName: patientName ? String(patientName) : undefined,
          department: departmentStr,
          revenue: isNaN(revenue) ? 0 : revenue,
          status: String(status),
          totalCount: isNaN(totalCount) ? 1 : totalCount,
          maleCount: isNaN(maleCount) ? 0 : maleCount,
          femaleCount: isNaN(femaleCount) ? 0 : femaleCount,
          contentHash,
          metadata: row,
        });
      } catch (e: any) {
        skipped++;
        parseErrors.push(`Row ${index}: ${e.message}`);
      }
    }

    let bulkWriteError = null;

    // Bulk insert with unordered to ignore duplicates
    if (recordsToInsert.length > 0) {
      try {
        const result = await ReportRecord.insertMany(recordsToInsert, { ordered: false });
        inserted = result.length;
      } catch (error: any) {
        // If it's a bulk write error (code 11000 duplicate key), we can still get the inserted count
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
    upload.validation.departments = Array.from(departments);
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
