import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";
import { getSession } from "@/lib/auth/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { password, adminUsername } = body;

    if (!password && !adminUsername) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await connectDB();

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Find the primary admin user for this tenant
    const adminUser = await User.findOne({ tenantId: id, role: "HOSPITAL_ADMIN" });
    if (!adminUser) {
      return NextResponse.json({ error: "No admin user found for this hospital" }, { status: 404 });
    }

    if (adminUsername && adminUsername !== adminUser.userId) {
      const existing = await User.findOne({ userId: adminUsername });
      if (existing) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
      adminUser.userId = adminUsername;
    }

    if (password) {
      const { hashPassword } = await import("@/lib/auth/password");
      adminUser.passwordHash = await hashPassword(password);
    }
    
    await adminUser.save();

    await logAction({
      actorId: session.id,
      actorRole: session.role,
      action: "PASSWORD_CHANGE",
      resource: "User",
      resourceId: adminUser._id.toString(),
      metadata: { tenantId: id },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("[Set Admin Password Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
