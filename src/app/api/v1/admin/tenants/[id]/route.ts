import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";
import { getSession } from "@/lib/auth/jwt";

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/v1/admin/tenants/[id]">
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Soft delete the tenant
    tenant.status = "suspended";
    await tenant.save();

    // Soft delete all users belonging to this tenant
    await User.updateMany({ tenantId: tenant._id }, { status: "disabled" });

    // Log the deletion
    await logAction({
      actorId: session.id,
      actorRole: "SUPER_ADMIN",
      tenantId: tenant._id.toString(),
      action: "HOSPITAL_UPDATE",
      resource: "Tenant",
      resourceId: tenant._id.toString(),
      metadata: { name: tenant.name, clientCode: tenant.clientCode },
      ipAddress: request.headers.get("x-forwarded-for") ?? "",
      userAgent: request.headers.get("user-agent") ?? "",
    });

    return NextResponse.json({ success: true, message: "Hospital deleted successfully" });
  } catch (err) {
    console.error("[Tenant DELETE Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
