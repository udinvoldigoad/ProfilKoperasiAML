import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8
};

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));

  if (role === "admin") {
    response.cookies.set("aml_admin_demo_session", "1", COOKIE_OPTIONS);
    response.cookies.delete("aml_member_demo_session");
    return response;
  }

  if (role === "anggota") {
    response.cookies.set("aml_member_demo_session", "1", COOKIE_OPTIONS);
    response.cookies.delete("aml_admin_demo_session");
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
