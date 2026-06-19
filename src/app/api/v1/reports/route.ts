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
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const search = searchParams.get("search") ?? "";
    const sort = searchParams.get("sort") ?? "-reportDate";
    const department = searchParams.get("department") ?? "";

    await connectDB();

    const query: Record<string, unknown> = { tenantId };

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
        { doctor: { $regex: search, $options: "i" } },
      ];
    }

    if (department) {
      query.department = department;
    }

    // Build sort object
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir = sort.startsWith("-") ? -1 : 1;

    const [reports, total] = await Promise.all([
      ReportRecord.find(query)
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReportRecord.countDocuments(query),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[Reports GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
