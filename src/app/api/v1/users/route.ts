import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { logAction } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const users = await User.find(
      { tenantId },
      { passwordHash: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[Users GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const actorId = request.headers.get("x-user-id");
    const actorRole = request.headers.get("x-user-role");

    if (!tenantId || !actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, name, email, phone, role, password } = body;

    if (!userId || !name || !password || !role) {
      return NextResponse.json(
        { error: "User ID, name, password, and role are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check duplicate
    const existing = await User.findOne({ tenantId, userId });
    if (existing) {
      return NextResponse.json({ error: "User ID already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      tenantId,
      userId,
      name,
      email,
      phone,
      role,
      passwordHash,
      mustChangePassword: true,
      createdBy: actorId,
    });

    await logAction({
      actorId,
      actorRole: actorRole ?? "HOSPITAL_ADMIN",
      tenantId,
      action: "USER_CREATION",
      resource: "User",
      resourceId: user._id.toString(),
      metadata: { userId, name, role },
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[Users POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
