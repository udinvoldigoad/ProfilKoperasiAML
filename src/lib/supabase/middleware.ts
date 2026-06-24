import { type NextRequest, NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Role } from "@/lib/auth-roles";

export type MiddlewareSession = {
  response: NextResponse;
  user: { id: string } | null;
  role: Role | null;
};

/**
 * Refreshes the Supabase auth session for middleware and resolves the user's
 * role from the profiles table. Returns the response carrying refreshed auth
 * cookies, which the caller must return (or copy cookies from).
 */
export async function getMiddlewareSession(request: NextRequest): Promise<MiddlewareSession> {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return { response, user: null, role: null };
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, user: null, role: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return { response, user: { id: user.id }, role: (profile?.role as Role) ?? null };
}
