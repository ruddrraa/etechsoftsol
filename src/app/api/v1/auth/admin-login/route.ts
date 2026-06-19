import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { signToken, setSessionCookie } from "@/lib/auth/jwt";
import { logAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      $or: [{ email }, { userId: email }],
      role: "SUPER_ADMIN",
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    user.failedLoginAttempts = 0;
    await user.save();

    const token = await signToken({
      sub: user._id.toString(),
      role: user.role,
    });

    await setSessionCookie(token);

    await logAction({
      actorId: user._id.toString(),
      actorRole: user.role,
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
      },
    });
  } catch (err) {
    console.error("[Auth Admin Login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
