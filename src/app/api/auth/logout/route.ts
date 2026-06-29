import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/login";
  return value;
}

/**
 * Logout is a POST (mutating) action so it is never triggered by Next.js
 * <Link> prefetching. A prefetched GET logout would silently end the session
 * on every page that renders a "Keluar" link — which is exactly what happened
 * in production where prefetch is enabled.
 */
export async function POST(request: NextRequest) {
  const formNext = (await request.formData().catch(() => null))?.get("next");
  const next = safeNext(typeof formNext === "string" ? formNext : request.nextUrl.searchParams.get("next"));

  // 303 forces the follow-up request to be a GET to the login page.
  const response = NextResponse.redirect(new URL(next, request.url), 303);

  // Real Supabase session sign-out (no-op when not configured).
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  return response;
}
