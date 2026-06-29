import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

function dashboardRedirect(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminArea = pathname.startsWith("/admin");
  const isMemberArea = pathname.startsWith("/anggota") || pathname === "/presensi/scan";

  const claims = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!claims) {
    return loginRedirect(request);
  }

  if (isAdminArea && claims.role !== "admin") {
    return dashboardRedirect(request, "/anggota/dashboard");
  }

  if (isMemberArea && claims.role !== "anggota") {
    return dashboardRedirect(request, "/admin/dashboard");
  }

  const changePasswordPath = "/anggota/ganti-password";
  if (claims.role === "anggota" && claims.mustChangePassword && pathname !== changePasswordPath) {
    return dashboardRedirect(request, changePasswordPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/anggota/:path*", "/presensi/scan"]
};