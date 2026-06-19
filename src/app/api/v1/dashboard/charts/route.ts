import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ReportRecord } from "@/models/ReportRecord";
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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Revenue trend (daily for last 30 days)
    const revenueData = await ReportRecord.aggregate([
      { $match: { tenantId: { $eq: tenantId }, reportDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reportDate" } },
          revenue: { $sum: { $ifNull: ["$revenue", 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", revenue: 1, _id: 0 } },
    ]);

    // Patient trend (daily for last 30 days)
    const patientData = await ReportRecord.aggregate([
      { $match: { tenantId: { $eq: tenantId }, reportDate: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reportDate" } },
          patients: { 
            $sum: { 
              $cond: [
                { $regexMatch: { input: { $ifNull: ["$department", ""] }, regex: /^Total/i } },
                0,
                { $ifNull: ["$totalCount", 1] }
              ]
            } 
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", patients: 1, _id: 0 } },
    ]);

    // Department performance (all time, top 8)
    const departmentData = await ReportRecord.aggregate([
      { $match: { tenantId: { $eq: tenantId }, department: { $not: /^Total/i } } },
      {
        $group: {
          _id: "$department",
          patients: { $sum: { $ifNull: ["$totalCount", 1] } },
          revenue: { $sum: { $ifNull: ["$revenue", 0] } },
        },
      },
      { $sort: { patients: -1 } },
      { $limit: 8 },
      { $project: { name: "$_id", patients: 1, revenue: 1, _id: 0 } },
    ]);

    // Admissions vs Discharges (daily for last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const admDisData = await ReportRecord.aggregate([
      { $match: { tenantId: { $eq: tenantId }, reportDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reportDate" } },
          admissions: {
            $sum: { 
              $cond: [
                { $or: [
                  { $ne: [{ $type: "$admissionDate" }, "missing"] }, 
                  { $regexMatch: { input: { $ifNull: ["$department", ""] }, regex: /admission|IPD/i } }
                ]},
                { $ifNull: ["$totalCount", 1] }, 
                0
              ] 
            },
          },
          discharges: {
            $sum: { 
              $cond: [
                { $ne: [{ $type: "$dischargeDate" }, "missing"] }, 
                { $ifNull: ["$totalCount", 1] }, 
                0
              ] 
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", admissions: 1, discharges: 1, _id: 0 } },
    ]);

    // Helper to generate date ranges
    const generateDateRange = (days: number) => {
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
      }
      return dates;
    };

    const last30Days = generateDateRange(30);
    const last7Days = generateDateRange(7);

    const mergeData = (range: string[], data: any[], keys: string[]) => {
      const map = new Map(data.map(d => [d.name, d]));
      return range.map(date => {
        if (map.has(date)) return map.get(date);
        const empty: any = { name: date };
        keys.forEach(k => empty[k] = null);
        return empty;
      });
    };

    return NextResponse.json({
      revenue: mergeData(last30Days, revenueData, ["revenue"]),
      patients: mergeData(last30Days, patientData, ["patients"]),
      departments: departmentData,
      admissionsDischarges: mergeData(last7Days, admDisData, ["admissions", "discharges"]),
    });
  } catch (err: unknown) {
    console.error("[Dashboard Charts]", err);
    return NextResponse.json({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
