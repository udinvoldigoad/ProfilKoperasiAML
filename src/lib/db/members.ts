import type { Member, MemberStatus, MemberType } from "@/types";
import { members as demoMembers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { memberNikToAuthEmail } from "@/lib/auth-identifiers";

type MemberRow = {
  id: string;
  profile_id: string | null;
  member_number: string;
  full_name: string;
  nik: string;
  birth_place: string;
  birth_date: string;
  address: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  status: MemberStatus;
  member_type: MemberType;
  created_at: string;
};

const MEMBER_COLUMNS =
  "id, profile_id, member_number, full_name, nik, birth_place, birth_date, address, photo_url, email, phone, status, member_type, created_at";

function mapMemberRow(row: MemberRow): Member {
  return {
    id: row.id,
    profileId: row.profile_id ?? "",
    memberNumber: row.member_number,
    fullName: row.full_name,
    nik: row.nik,
    birthPlace: row.birth_place,
    birthDate: row.birth_date,
    address: row.address,
    photoUrl: row.photo_url ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    status: row.status,
    memberType: row.member_type,
    createdAt: row.created_at
  };
}

/** All active (non-deleted) members. Falls back to demo data when unconfigured. */
export async function listMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured()) return demoMembers;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoMembers;

  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .is("deleted_at", null)
    .order("member_number", { ascending: true });

  if (error || !data) return demoMembers;
  return (data as MemberRow[]).map(mapMemberRow);
}

/** Single member by id. Falls back to demo data when unconfigured. */
export async function getMember(id: string): Promise<Member | null> {
  if (!isSupabaseConfigured()) {
    return demoMembers.find((member) => member.id === id) ?? null;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoMembers.find((member) => member.id === id) ?? null;

  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapMemberRow(data as MemberRow);
}

/**
 * Full member fetch for a server-trusted id (e.g. the logged-in member's own
 * id from the verified session). Uses the service role so it never depends on
 * the member-row RLS policy resolving correctly for the anon client.
 */
export async function getMemberForSession(id: string): Promise<Member | null> {
  if (!isSupabaseConfigured()) {
    return demoMembers.find((member) => member.id === id) ?? null;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return demoMembers.find((member) => member.id === id) ?? null;

  const { data, error } = await admin
    .from("members")
    .select(MEMBER_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapMemberRow(data as MemberRow);
}

export type CreateMemberInput = {
  memberNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  email?: string;
  phone?: string;
  memberType: MemberType;
  status: MemberStatus;
};

export type CreateMemberResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Creates a member end-to-end: a NIK-based auth user, a profile (role anggota),
 * and the member row. Requires the service-role key. Default password = NIK.
 */
export async function createMember(input: CreateMemberInput): Promise<CreateMemberResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };
  }

  // Reject duplicate NIK / member number early for a clear message.
  const { data: existing } = await admin
    .from("members")
    .select("id")
    .or(`nik.eq.${input.nik},member_number.eq.${input.memberNumber}`)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "NIK atau No Anggota sudah terdaftar." };
  }

  const email = memberNikToAuthEmail(input.nik);
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password: input.nik,
    email_confirm: true,
    app_metadata: { role: "anggota" }
  });

  if (authError || !created?.user) {
    return { ok: false, error: authError?.message ?? "Gagal membuat akun anggota." };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(
      { auth_user_id: created.user.id, role: "anggota", email: input.email ?? null, phone: input.phone ?? null },
      { onConflict: "auth_user_id" }
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    return { ok: false, error: profileError?.message ?? "Gagal membuat profil anggota." };
  }

  const { data: member, error: memberError } = await admin
    .from("members")
    .insert({
      profile_id: profile.id,
      member_number: input.memberNumber,
      full_name: input.fullName,
      nik: input.nik,
      birth_place: input.birthPlace,
      birth_date: input.birthDate,
      address: input.address,
      email: input.email ?? null,
      phone: input.phone ?? null,
      status: input.status,
      member_type: input.memberType
    })
    .select("id")
    .single();

  if (memberError || !member) {
    return { ok: false, error: memberError?.message ?? "Gagal menyimpan data anggota." };
  }

  return { ok: true, id: member.id };
}

export type UpdateMemberInput = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  email?: string;
  phone?: string;
  memberType: MemberType;
  status: MemberStatus;
};

export type MutationResult = { ok: true } | { ok: false; error: string };

/** Updates editable member fields (NIK and member number stay fixed). */
export async function updateMember(id: string, input: UpdateMemberInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin
    .from("members")
    .update({
      full_name: input.fullName,
      birth_place: input.birthPlace,
      birth_date: input.birthDate,
      address: input.address,
      email: input.email ?? null,
      phone: input.phone ?? null,
      member_type: input.memberType,
      status: input.status
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type UpdateMemberProfileInput = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone?: string;
};

/**
 * Self-service profile update for the logged-in member. Only personal fields
 * are editable — member number, NIK, status, member type, and email are never
 * touched here (those stay admin-controlled). The id must come from the
 * verified session, never from request input.
 */
export async function updateMemberProfile(id: string, input: UpdateMemberProfileInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin
    .from("members")
    .update({
      full_name: input.fullName,
      birth_place: input.birthPlace,
      birth_date: input.birthDate,
      address: input.address,
      phone: input.phone ?? null
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Soft-deletes a member: sets deleted_at and marks the row nonaktif. */
export async function softDeleteMember(id: string): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin
    .from("members")
    .update({ deleted_at: new Date().toISOString(), status: "nonaktif" })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type ResetPasswordResult = { ok: true; password: string } | { ok: false; error: string };

/** Resets a member's login password back to their NIK. Returns the new password. */
export async function resetMemberPassword(id: string): Promise<ResetPasswordResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { data: member, error } = await admin
    .from("members")
    .select("nik, profile_id, profiles(auth_user_id)")
    .eq("id", id)
    .maybeSingle<{ nik: string; profile_id: string | null; profiles: { auth_user_id: string | null } | null }>();

  if (error || !member) return { ok: false, error: "Anggota tidak ditemukan." };
  const authUserId = member.profiles?.auth_user_id;
  if (!authUserId) return { ok: false, error: "Anggota belum punya akun login." };

  const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, { password: member.nik });
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true, password: member.nik };
}
