import { NextRequest, NextResponse } from "next/server";
import { isValidNik } from "@/lib/auth-identifiers";
import { DASHBOARD_BY_ROLE, type Role } from "@/lib/auth-roles";
import { clientIp } from "@/lib/db/audit-logs";
import { checkLoginAllowed, clearLoginFailures, registerLoginFailure } from "@/lib/login-rate-limit";
import { verifyPassword } from "@/lib/passwords";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { setSessionCookie, signSession } from "@/lib/session";

function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database MySQL belum dikonfigurasi. Isi DATABASE_URL dari Hostinger terlebih dahulu." },
      { status: 503 }
    );
  }

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

  try {
    const profile =
      mode === "admin"
        ? await prisma.profile.findFirst({
            where: { role: "admin", email: identifier.toLowerCase() },
            include: { member: true }
          })
        : isValidNik(identifier)
          ? await prisma.profile.findFirst({
              where: {
                role: "anggota",
                member: { nik: identifier, deletedAt: null }
              },
              include: { member: true }
            })
          : null;

    if (mode === "anggota" && !isValidNik(identifier)) {
      return NextResponse.json({ error: "NIK harus 16 digit angka." }, { status: 400 });
    }

    if (!profile || !verifyPassword(password, profile.passwordHash)) {
      registerLoginFailure(rateKey);
      const message = mode === "anggota" ? "NIK atau password salah." : "Email atau password salah.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    clearLoginFailures(rateKey);

    const role = profile.role as Role;
    if (mode === "admin" && role !== "admin") {
      return NextResponse.json({ error: "Akun ini bukan akun admin." }, { status: 403 });
    }
    if (mode === "anggota" && role !== "anggota") {
      return NextResponse.json({ error: "Gunakan form login admin untuk akun ini." }, { status: 403 });
    }

    if (mode === "anggota") {
      if (!profile.member || profile.member.deletedAt) {
        return NextResponse.json(
          { error: "Akun anggota belum terhubung ke data anggota. Hubungi admin koperasi." },
          { status: 403 }
        );
      }

      if (profile.member.status !== "aktif") {
        return NextResponse.json({ error: "Akun anggota belum aktif." }, { status: 403 });
      }
    }

    const token = await signSession({
      profileId: profile.id,
      role,
      email: profile.email ?? null,
      memberId: profile.member?.id ?? null,
      memberStatus: profile.member?.status ?? null,
      mustChangePassword: profile.mustChangePassword
    });

    const redirectTo = safeNext(body.next) ?? DASHBOARD_BY_ROLE[role];
    const response = NextResponse.json({ ok: true, redirectTo });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Gagal memeriksa akun. Periksa koneksi database MySQL." }, { status: 500 });
  }
}