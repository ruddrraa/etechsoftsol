import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";
import { getSession } from "@/lib/auth/jwt";
import Papa from "papaparse";
import * as xlsx from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
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
      return NextResponse.json({ error: "Only CSV and Excel files are supported for import." }, { status: 400 });
    }

    await connectDB();

    const buffer = Buffer.from(await file.arrayBuffer());
    
    let rows: any[] = [];
    if (isCsv) {
      const csvString = buffer.toString("utf-8");
      const parseResult = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
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

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        const name = row["Hospital Name"] || row["name"] || row["Name"];
        const clientCode = row["Client Code"] || row["clientCode"] || row["client_code"];
        
        const adminEmail = row["Email"] || row["Admin Email"] || row["email"];
        let adminUsername = row["Username"] || row["Admin Username"] || row["username"];
        let adminPassword = row["Admin Password"] || row["password"];
        const status = row["Status"] || row["status"] || "Active";

        if (!name || !clientCode) {
          skipped++;
          errors.push(`Row ${index + 1}: Missing required Hospital Name or Client Code`);
          continue;
        }

        // Generate fallbacks
        if (!adminUsername) {
          adminUsername = clientCode.toLowerCase().replace(/[^a-z0-9]/g, ""); // Use client code as default username
        }
        if (!adminPassword) {
          adminPassword = `${clientCode}@123`; // Default password
        }

        // Check if exists
        const existingTenant = await Tenant.findOne({ clientCode });
        const existingUser = await User.findOne({ $or: [{ userId: adminUsername }, { email: adminEmail || "no-match" }] });

        if (existingTenant || existingUser) {
          skipped++;
          errors.push(`Row ${index + 1}: Tenant or User already exists`);
          continue;
        }

        const contactPerson = row["Contact Person"] || row["contactPerson"] || "";
        const phone = row["Phone"] || row["phone"] || "";
        const tenantEmail = row["Email"] || row["email"] || "";

        const tenant = await Tenant.create({
          name,
          clientCode,
          contactPerson,
          phone,
          email: tenantEmail,
          settings: { theme: "light" },
        });

        const { hashPassword } = await import("@/lib/auth/password");
        const passwordHash = await hashPassword(adminPassword);

        await User.create({
          tenantId: tenant._id,
          userId: adminUsername,
          ...(adminEmail && { email: adminEmail }),
          passwordHash,
          name: `${name} Admin`,
          role: "HOSPITAL_ADMIN",
        });

        inserted++;
      } catch (err: unknown) {
        skipped++;
        errors.push(`Row ${index + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    await logAction({
      actorId: session.id,
      actorRole: session.role,
      action: "HOSPITAL_CREATION",
      resource: "Tenant",
      resourceId: "batch",
      metadata: { inserted, skipped, errors },
    });

    return NextResponse.json({
      success: true,
      stats: { inserted, skipped, errors: errors.slice(0, 10) },
    });
  } catch (err) {
    console.error("[Tenant Import Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
