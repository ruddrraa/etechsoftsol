import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { AuditLog } from "@/models/AuditLog";
import { getSession } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const tenantId = searchParams.get("tenantId");

    await connectDB();

    const query: any = {};
    if (session.role !== "SUPER_ADMIN") {
      // If hospital user, only show their tenant's logs
      query.tenantId = session.tenantId;
    } else if (tenantId) {
      // Super admin can filter by tenant
      query.tenantId = tenantId;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[Audit Logs GET Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
