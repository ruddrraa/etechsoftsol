import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { JwtPayload } from "@/types";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/admin/login",
  "/forgot-password",
  "/reset-password",
  "/setup-password",
];

const API_PUBLIC_PATHS = [
  "/api/v1/auth/login", 
  "/api/v1/auth/admin-login", 
  "/api/health",
  "/api/v1/tenants/public-list"
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isPublicApi(pathname: string): boolean {
  return API_PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

async function getPayload(request: NextRequest): Promise<JwtPayload | null> {
  const token = request.cookies.get("insighthms_session")?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    if (isPublicApi(pathname)) return NextResponse.next();
    const payload = await getPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-role", payload.role);
    if (payload.tenantId) requestHeaders.set("x-tenant-id", payload.tenantId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const payload = await getPayload(request);

  if (!payload) {
    const loginUrl = pathname.startsWith("/admin")
      ? new URL("/admin/login", request.url)
      : new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && payload.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/hospital/dashboard", request.url));
  }

  if (pathname.startsWith("/hospital")) {
    const allowedRoles = ["HOSPITAL_ADMIN", "HOSPITAL_USER", "SUPER_ADMIN"];
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const adminOnlyPaths = ["/hospital/users", "/hospital/settings", "/hospital/ai-insights", "/hospital/snapshots"];
    if (
      adminOnlyPaths.some((p) => pathname.startsWith(p)) &&
      payload.role === "HOSPITAL_USER"
    ) {
      return NextResponse.redirect(new URL("/hospital/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hospital/:path*",
    "/api/v1/:path*",
  ],
};
