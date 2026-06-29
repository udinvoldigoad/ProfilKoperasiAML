import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { memberNikToAuthEmail } from "@/lib/auth-identifiers";
import { events, members, siteProfile } from "@/lib/data";
import type { Role } from "@/lib/auth-roles";

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
type AuthUser = { id: string; email?: string | null };

type EnsureAuthResult =
  | { ok: true; user: AuthUser; created: boolean }
  | { ok: false; error: string };

/**
 * One-time seeding for real auth. Creates the admin auth user, one auth user per
 * initial members (NIK-based email), matching profiles/members rows, and initial events
 * so QR tokens shown in admin can be validated against Supabase.
 *
 *   POST /api/admin/seed   header: x-seed-secret: <SEED_SECRET>
 *
 * Default member password = their NIK (admin should require a reset later).
 * Existing auth users are linked without changing their password.
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 */
async function findAuthUserByEmail(supabase: SupabaseAdmin, email: string) {
  const normalized = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { user: null, error: error.message };

    const user = data.users.find((item) => item.email?.toLowerCase() === normalized);
    if (user) return { user: { id: user.id, email: user.email } satisfies AuthUser, error: null };
    if (data.users.length < 1000) break;
  }

  return { user: null, error: null };
}

async function ensureAuthUser(supabase: SupabaseAdmin, email: string, password: string, role: Role): Promise<EnsureAuthResult> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role }
  });

  if (data?.user) {
    return { ok: true, user: { id: data.user.id, email: data.user.email }, created: true };
  }

  if (!error || !/already.*registered|already.*exists|exists|registered/i.test(error.message)) {
    return { ok: false, error: error?.message ?? "Gagal membuat auth user." };
  }

  const existing = await findAuthUserByEmail(supabase, email);
  if (existing.error) return { ok: false, error: existing.error };
  if (!existing.user) return { ok: false, error: `Auth user ${email} sudah ada, tetapi tidak bisa ditemukan ulang.` };

  return { ok: true, user: existing.user, created: false };
}

export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret || request.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  const result = {
    admin: "",
    membersCreated: 0,
    membersLinked: 0,
    membersSkipped: 0,
    eventsUpserted: 0,
    errors: [] as string[]
  };

  // 1. Admin user + profile.
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? siteProfile.email).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  let adminProfileId: string | null = null;

  if (!adminPassword) {
    return NextResponse.json({ error: "SEED_ADMIN_PASSWORD wajib diisi." }, { status: 400 });
  }

  const adminAuth = await ensureAuthUser(supabase, adminEmail, adminPassword, "admin");
  if (!adminAuth.ok) {
    result.errors.push(`admin: ${adminAuth.error}`);
    result.admin = adminEmail;
  } else {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .upsert({ auth_user_id: adminAuth.user.id, role: "admin", email: adminEmail }, { onConflict: "auth_user_id" })
      .select("id")
      .single<{ id: string }>();

    if (profileErr || !profile) {
      result.errors.push(`admin profile: ${profileErr?.message ?? "gagal"}`);
    } else {
      adminProfileId = profile.id;
    }

    result.admin = adminAuth.created ? adminEmail : `${adminEmail} (sudah ada, ditautkan ulang)`;
  }

  // 2. Member users + profiles + member rows.
  for (const member of members) {
    const email = memberNikToAuthEmail(member.nik);
    const auth = await ensureAuthUser(supabase, email, member.nik, "anggota");

    if (!auth.ok) {
      result.errors.push(`${member.nik}: ${auth.error}`);
      continue;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .upsert(
        { auth_user_id: auth.user.id, role: "anggota", email: member.email ?? null, phone: member.phone ?? null },
        { onConflict: "auth_user_id" }
      )
      .select("id")
      .single<{ id: string }>();

    if (profileErr || !profile) {
      result.errors.push(`${member.nik} profile: ${profileErr?.message ?? "gagal"}`);
      continue;
    }

    const { error: memberErr } = await supabase.from("members").upsert(
      {
        profile_id: profile.id,
        member_number: member.memberNumber,
        full_name: member.fullName,
        nik: member.nik,
        birth_place: member.birthPlace,
        birth_date: member.birthDate,
        address: member.address,
        photo_url: member.photoUrl ?? null,
        email: member.email ?? null,
        phone: member.phone ?? null,
        status: member.status,
        member_type: member.memberType
      },
      { onConflict: "nik" }
    );

    if (memberErr) {
      result.errors.push(`${member.nik} member: ${memberErr.message}`);
      continue;
    }

    if (auth.created) result.membersCreated += 1;
    else result.membersLinked += 1;
  }

  // 3. Initial events for QR validation.
  for (const event of events) {
    const { error } = await supabase.from("events").upsert(
      {
        title: event.title,
        date: event.date,
        start_time: event.startTime,
        end_time: event.endTime,
        location: event.location,
        description: event.description,
        status: event.status,
        qr_token: event.qrToken,
        qr_expires_at: event.qrExpiresAt,
        created_by: adminProfileId
      },
      { onConflict: "qr_token" }
    );

    if (error) {
      result.errors.push(`${event.qrToken} event: ${error.message}`);
      continue;
    }

    result.eventsUpserted += 1;
  }

  return NextResponse.json({ ok: true, ...result });
}
