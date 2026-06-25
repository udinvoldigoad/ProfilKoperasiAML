import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8
};

function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

/**
 * Demo login is a POST (mutating) action so it is never triggered by Next.js
 * <Link> prefetching, which would otherwise set a demo session cookie just by
 * rendering the login page.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const role = form?.get("role");
  const next = safeNext(form?.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url), 303);

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

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
