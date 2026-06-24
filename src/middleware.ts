import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMiddlewareSession } from "@/lib/supabase/middleware";

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

  // Demo fallback: when Supabase is not configured, gate on demo cookies.
  if (!isSupabaseConfigured()) {
    if (isAdminArea && request.cookies.get("aml_admin_demo_session")?.value !== "1") {
      return loginRedirect(request);
    }
    if (isMemberArea && request.cookies.get("aml_member_demo_session")?.value !== "1") {
      return loginRedirect(request);
    }
    return NextResponse.next();
  }

  // Real Supabase session.
  const { response, user, role } = await getMiddlewareSession(request);

  if (!user) {
    return loginRedirect(request);
  }

  if (isAdminArea && role !== "admin") {
    return dashboardRedirect(request, "/anggota/dashboard");
  }

  if (isMemberArea && role !== "anggota") {
    return dashboardRedirect(request, "/admin/dashboard");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/anggota/:path*", "/presensi/scan"]
};
