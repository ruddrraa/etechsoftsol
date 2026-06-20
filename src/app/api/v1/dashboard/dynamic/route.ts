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

    await connectDB();

    // Find the latest successful upload to determine the schema
    const latestUpload = await Upload.findOne({ tenantId, status: "completed" }).sort({ createdAt: -1 }).lean();
    
    if (!latestUpload || !latestUpload.fileSchema) {
       return NextResponse.json({ 
          schema: null, 
          kpis: [], 
          charts: { departmentDistribution: [], maleVsFemale: [], trend: [] },
          rawData: []
       });
    }

    const schemaFields = latestUpload.fileSchema.fields || [];
    
    // Build KPI aggregation
    const kpiGroup: any = { _id: null, departmentCount: { $addToSet: "$data.Department" } };
    
    const numericFields = schemaFields.filter(f => f.type === "number").map(f => f.name);
    for (const field of numericFields) {
      kpiGroup[field] = { $sum: `$data.${field}` };
    }

    const [kpiStats] = await ReportRecord.aggregate([
      { $match: { tenantId } },
      { $group: kpiGroup }
    ]);

    const kpis = [];
    if (kpiStats) {
      for (const field of numericFields) {
         kpis.push({ label: field.replace(/_/g, " "), value: kpiStats[field] || 0 });
      }
      kpis.push({ label: "Department Count", value: (kpiStats.departmentCount || []).length });
    }

    // Chart 1: Department Distribution
    const departmentDistribution = await ReportRecord.aggregate([
      { $match: { tenantId, "data.Department": { $exists: true } } },
      { $group: { _id: "$data.Department", count: { $sum: "$data.Total_Count" } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } },
      { $sort: { value: -1 } }
    ]);

    // Chart 2: Male vs Female (Aggregate totals)
    const maleVsFemale = [
      { name: "Male", value: kpiStats?.Male_Count || 0 },
      { name: "Female", value: kpiStats?.Female_Count || 0 }
    ];

    // Chart 3: Date-wise Trend
    const trend = await ReportRecord.aggregate([
      { $match: { tenantId } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reportDate" } },
          totalCount: { $sum: "$data.Total_Count" },
          maleCount: { $sum: "$data.Male_Count" },
          femaleCount: { $sum: "$data.Female_Count" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", totalCount: 1, maleCount: 1, femaleCount: 1, _id: 0 } }
    ]);

    // Raw Data Table (latest 100 rows)
    const rawDataRecords = await ReportRecord.find({ tenantId })
      .sort({ reportDate: -1 })
      .limit(100)
      .lean();
    
    const rawData = rawDataRecords.map(r => r.data);

    return NextResponse.json({
      schema: schemaFields,
      kpis,
      charts: {
        departmentDistribution,
        maleVsFemale,
        trend
      },
      rawData
    });
  } catch (err: any) {
    console.error("[Dashboard Dynamic]", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
