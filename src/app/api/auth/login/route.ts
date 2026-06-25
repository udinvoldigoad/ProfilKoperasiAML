import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isValidNik, memberNikToAuthEmail } from "@/lib/auth-identifiers";
import { DASHBOARD_BY_ROLE, type Role } from "@/lib/auth-roles";
import { clientIp } from "@/lib/db/audit-logs";
import { checkLoginAllowed, clearLoginFailures, registerLoginFailure } from "@/lib/login-rate-limit";

function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase belum dikonfigurasi. Gunakan tombol Masuk Demo." },
      { status: 503 }
    );
  }

  // Server-side brute-force throttle per IP.
  const rateKey = clientIp(request) ?? "unknown";
  const gate = checkLoginAllowed(rateKey);
  if (!gate.allowed) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfterSec / 60));
    return NextResponse.json(
      { error: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${minutes} menit atau hubungi admin.` },
      { status: 429, headers: { "Retry-After": String(gate.retryAfterSec) } }
    );
  }

  let body: { mode?: string; identifier?: string; password?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const mode = body.mode === "admin" ? "admin" : "anggota";
  const identifier = (body.identifier ?? "").trim();
  const password = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json({ error: "Identitas dan password wajib diisi." }, { status: 400 });
  }

  let email: string;
  if (mode === "anggota") {
    if (!isValidNik(identifier)) {
      return NextResponse.json({ error: "NIK harus 16 digit angka." }, { status: 400 });
    }
    email = memberNikToAuthEmail(identifier);
  } else {
    email = identifier.toLowerCase();
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    registerLoginFailure(rateKey);
    const message = mode === "anggota" ? "NIK atau password salah." : "Email atau password salah.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  // Valid credentials — never keep this IP throttled.
  clearLoginFailures(rateKey);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Service role Supabase belum dikonfigurasi." }, { status: 503 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Profil akun belum dibuat. Jalankan seed atau hubungi admin koperasi." },
      { status: 403 }
    );
  }

  const role = profile.role as Role;

  // Block role mismatch (e.g. admin trying the anggota tab) for a clear UX.
  if (mode === "admin" && role !== "admin") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Akun ini bukan akun admin." }, { status: 403 });
  }
  if (mode === "anggota" && role !== "anggota") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Gunakan form login admin untuk akun ini." }, { status: 403 });
  }

  if (mode === "anggota") {
    const { data: member } = await admin
      .from("members")
      .select("id, status")
      .eq("profile_id", profile.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!member) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Akun anggota belum terhubung ke data anggota. Hubungi admin koperasi." },
        { status: 403 }
      );
    }

    if (member.status !== "aktif") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Akun anggota belum aktif." }, { status: 403 });
    }
  }

  const redirectTo = safeNext(body.next) ?? DASHBOARD_BY_ROLE[role];
  return NextResponse.json({ ok: true, redirectTo });
}
