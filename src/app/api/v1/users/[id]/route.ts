import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { logAction } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/v1/users/[id]">
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const user = await User.findOne(
      { _id: id, tenantId },
      { passwordHash: 0 }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[User GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/v1/users/[id]">
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const actorId = request.headers.get("x-user-id");
    const actorRole = request.headers.get("x-user-role");

    if (!tenantId || !actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = await request.json();
    const { name, email, phone, role, status } = body;

    await connectDB();

    const user = await User.findOne({ _id: id, tenantId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) {
      const oldStatus = user.status;
      user.status = status;
      if (status === "disabled" && oldStatus !== "disabled") {
        await logAction({
          actorId,
          actorRole: actorRole ?? "HOSPITAL_ADMIN",
          tenantId,
          action: "USER_DISABLE",
          resource: "User",
          resourceId: id,
          metadata: { userId: user.userId, name: user.name },
        });
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("[User PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/v1/users/[id]">
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const actorId = request.headers.get("x-user-id");
    const actorRole = request.headers.get("x-user-role");

    if (!tenantId || !actorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const user = await User.findOne({ _id: id, tenantId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.status = "disabled";
    await user.save();

    await logAction({
      actorId,
      actorRole: actorRole ?? "HOSPITAL_ADMIN",
      tenantId,
      action: "USER_DISABLE",
      resource: "User",
      resourceId: id,
      metadata: { userId: user.userId, name: user.name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[User DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
