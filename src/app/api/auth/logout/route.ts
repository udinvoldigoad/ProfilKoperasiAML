import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/login";
  return value;
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));

  // Real Supabase session sign-out (no-op when not configured).
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  // Also clear demo cookies.
  response.cookies.delete("aml_admin_demo_session");
  response.cookies.delete("aml_member_demo_session");
  return response;
}
