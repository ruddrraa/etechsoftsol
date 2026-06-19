import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/jwt";
import { logAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      await logAction({
        actorId: session.id,
        actorRole: session.role,
        tenantId: session.tenantId,
        action: "USER_LOGOUT",
        resource: "User",
        resourceId: session.id,
        ipAddress: request.headers.get("x-forwarded-for") ?? "",
        userAgent: request.headers.get("user-agent") ?? "",
      });
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Auth Logout]", err);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
