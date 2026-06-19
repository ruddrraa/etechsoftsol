import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Tenant } from "@/models/Tenant";
import { verifyPassword } from "@/lib/auth/password";
import { signToken, setSessionCookie } from "@/lib/auth/jwt";
import { logAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hospitalId, userId, password, role } = body;

    if (!hospitalId || !userId || !password || !role) {
      return NextResponse.json(
        { error: "Hospital, role, user ID, and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the tenant
    const tenant = await Tenant.findById(hospitalId);
    if (!tenant || tenant.status !== "active") {
      return NextResponse.json(
        { error: "Hospital not found or inactive" },
        { status: 401 }
      );
    }

    // Find the user
    const user = await User.findOne({ tenantId: tenant._id, userId });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Validate the requested role matches the user's actual role
    if (user.role !== role) {
      return NextResponse.json(
        { error: `Access denied. Account is not registered as a ${role === 'HOSPITAL_ADMIN' ? 'Hospital Admin' : 'Hospital User'}.` }, 
        { status: 403 }
      );
    }

    // Check user status
    if (user.status === "disabled") {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    // Check lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Account is temporarily locked. Try again later." },
        { status: 429 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await user.save();
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Sign JWT
    const token = await signToken({
      sub: user._id.toString(),
      role: user.role,
      tenantId: tenant._id.toString(),
      tenantName: tenant.name,
    });

    await setSessionCookie(token);

    // Audit log
    await logAction({
      actorId: user._id.toString(),
      actorRole: user.role,
      tenantId: tenant._id.toString(),
      action: "USER_LOGIN",
      resource: "User",
      resourceId: user._id.toString(),
      ipAddress: request.headers.get("x-forwarded-for") ?? "",
      userAgent: request.headers.get("user-agent") ?? "",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        role: user.role,
        tenantName: tenant.name,
      },
    });
  } catch (err) {
    console.error("[Auth Login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
