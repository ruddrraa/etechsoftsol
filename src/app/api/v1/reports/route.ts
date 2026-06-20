import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ReportRecord } from "@/models/ReportRecord";
import { Upload } from "@/models/Upload";
import { getSession } from "@/lib/auth/jwt";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const tenantId = new mongoose.Types.ObjectId(session.tenantId);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const sort = searchParams.get("sort") ?? "-reportDate";

    await connectDB();

    const latestUpload = await Upload.findOne({ tenantId, status: "completed" }).sort({ createdAt: -1 }).lean();
    const schema = latestUpload?.fileSchema?.fields || [];

    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir = sort.startsWith("-") ? -1 : 1;

    const [records, total] = await Promise.all([
      ReportRecord.find({ tenantId })
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReportRecord.countDocuments({ tenantId }),
    ]);

    const reports = records.map(r => r.data);

    return NextResponse.json({
      schema,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("[Reports GET]", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
