import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { Upload } from "@/models/Upload";
import { AuditLog } from "@/models/AuditLog";
import { getSession } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [activeHospitals, totalUsers, reportsProcessed, apiRequests] = await Promise.all([
      Tenant.countDocuments({ status: "active" }),
      User.countDocuments({ status: "active" }),
      Upload.countDocuments({ status: "completed" }),
      AuditLog.countDocuments()
    ]);

    return NextResponse.json({
      metrics: {
        activeHospitals,
        totalUsers,
        reportsProcessed,
        apiRequests,
        systemErrors: 0
      }
    });
  } catch (err) {
    console.error("[Dashboard GET Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
