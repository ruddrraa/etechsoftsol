import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Tenant } from "@/models/Tenant";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";
import { getSession } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, clientCode, adminUsername, adminPassword } = body;

    if (!name || !clientCode || !adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check if client code or username already exists
    const existingTenant = await Tenant.findOne({ clientCode });
    if (existingTenant) {
      return NextResponse.json({ error: "Client code already exists" }, { status: 400 });
    }

    const existingUser = await User.findOne({ userId: adminUsername });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    // Create the tenant
    const tenant = await Tenant.create({
      name,
      clientCode,
      settings: {
        theme: "light",
      },
    });

    const { hashPassword } = await import("@/lib/auth/password");
    const passwordHash = await hashPassword(adminPassword);

    // Create the initial admin user for this tenant
    const user = await User.create({
      tenantId: tenant._id,
      userId: adminUsername, // Save as Username (userId)
      passwordHash, 
      name: `${name} Admin`,
      role: "HOSPITAL_ADMIN",
    });

    await logAction({
      actorId: session.id,
      actorRole: session.role,
      action: "HOSPITAL_CREATION",
      resource: "Tenant",
      resourceId: tenant._id.toString(),
      metadata: { name, clientCode, adminUsername },
    });

    return NextResponse.json({ success: true, tenant, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[Create Tenant Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
    
    // Fetch primary admin for each tenant
    const tenantIds = tenants.map(t => t._id);
    const admins = await User.find({ tenantId: { $in: tenantIds }, role: "HOSPITAL_ADMIN" }).lean();
    
    const adminMap = new Map();
    for (const admin of admins) {
      if (admin.tenantId && !adminMap.has(admin.tenantId.toString())) {
        adminMap.set(admin.tenantId.toString(), admin.userId);
      }
    }

    const data = tenants.map(t => ({
      ...t,
      adminUsername: adminMap.get(t._id.toString()) || "N/A"
    }));

    return NextResponse.json({ tenants: data });
  } catch (err) {
    console.error("[Get Tenants Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
