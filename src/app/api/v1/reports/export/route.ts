import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ReportRecord } from "@/models/ReportRecord";

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") ?? "csv";
    const department = searchParams.get("department") ?? "";

    await connectDB();

    const query: Record<string, unknown> = { tenantId };
    if (department) query["data.department"] = department;

    const reports = await ReportRecord.find(query)
      .sort({ reportDate: -1 })
      .limit(10000)
      .lean();

    if (format === "csv") {
      const headers = ["Date", "Patient ID", "Patient Name", "Department", "Doctor", "Revenue", "Pending Bill", "Status"];
      const rows = reports.map((r) => [
        r.reportDate ? new Date(r.reportDate).toLocaleDateString("en-IN") : "",
        r.data?.patientId ?? "",
        r.data?.patientName ?? "",
        r.data?.department ?? "",
        r.data?.doctor ?? "",
        r.data?.revenue ?? 0,
        r.data?.pendingBill ?? 0,
        r.data?.status ?? "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
      const filename = `reports-${new Date().toISOString().split("T")[0]}.csv`;

      // Save to R2 in the exports folder for audit/persistence
      try {
        const { uploadFileToR2, generateR2Key } = await import("@/lib/r2");
        const r2Key = generateR2Key(tenantId, filename, "exports");
        const buffer = Buffer.from(csv, "utf-8");
        if (process.env.R2_ACCOUNT_ID) {
          await uploadFileToR2(r2Key, buffer, "text/csv");
        }
      } catch (e) {
        console.error("Failed to save export to R2 (non-fatal)", e);
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // JSON fallback
    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[Reports Export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
