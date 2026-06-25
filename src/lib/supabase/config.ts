export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Force demo mode (login tanpa akun, data contoh) walau kredensial Supabase ada. */
export const FORCE_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/**
 * True when the app should use the real Supabase backend. False puts the whole
 * app into demo mode (hardcoded sample data + one-click demo login), which is
 * ideal for showing the app to many people without entering any real data.
 * Set NEXT_PUBLIC_DEMO_MODE=true to force demo even when credentials exist.
 */
export function isSupabaseConfigured() {
  if (FORCE_DEMO_MODE) return false;
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
