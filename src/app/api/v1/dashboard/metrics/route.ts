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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Helper to calculate sums while avoiding double counting of "Total_" summary rows
    const groupStage = {
      $group: {
        _id: null,
        totalPatients: { 
          $sum: { 
            $cond: [
              { $regexMatch: { input: "$department", regex: /^Total/i } },
              0, // Do not count summary rows in the grand total
              { $ifNull: ["$totalCount", 1] }
            ]
          } 
        },
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
        revenue: { $sum: { $ifNull: ["$revenue", 0] } },
        pendingBills: { $sum: { $ifNull: ["$pendingBill", 0] } },
      },
    };

    // Current period aggregation
    const [currentStats] = await ReportRecord.aggregate([
      { $match: { tenantId: { $eq: tenantId }, reportDate: { $gte: sevenDaysAgo } } },
      groupStage,
    ]);

    // Previous period for comparison
    const [prevStats] = await ReportRecord.aggregate([
      {
        $match: {
          tenantId: { $eq: tenantId },
          reportDate: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
        },
      },
      groupStage,
    ]);

    function calcChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    }

    function formatCurrency(amount: number): string {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
      return `₹${amount.toLocaleString("en-IN")}`;
    }

    const cur = currentStats ?? { totalPatients: 0, admissions: 0, discharges: 0, revenue: 0, pendingBills: 0 };
    const prev = prevStats ?? { totalPatients: 0, admissions: 0, discharges: 0, revenue: 0, pendingBills: 0 };

    const metrics = [
      {
        label: "Total Patients",
        value: cur.totalPatients.toLocaleString("en-IN"),
        change: calcChange(cur.totalPatients, prev.totalPatients),
      },
      {
        label: "Admissions",
        value: cur.admissions.toLocaleString("en-IN"),
        change: calcChange(cur.admissions, prev.admissions),
      },
      {
        label: "Discharges",
        value: cur.discharges.toLocaleString("en-IN"),
        change: calcChange(cur.discharges, prev.discharges),
      },
      {
        label: "Revenue",
        value: formatCurrency(cur.revenue),
        change: calcChange(cur.revenue, prev.revenue),
      },
      {
        label: "Pending Bills",
        value: formatCurrency(cur.pendingBills),
        change: calcChange(cur.pendingBills, prev.pendingBills),
        trend: cur.pendingBills <= prev.pendingBills ? "down" as const : "up" as const,
      },
    ];

    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    console.error("[Dashboard Metrics]", err);
    return NextResponse.json({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
