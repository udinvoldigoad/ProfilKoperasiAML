import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Role } from "@/lib/auth-roles";

export type SessionMember = {
  id: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  status: string;
};

export type SessionUser = {
  authUserId: string;
  profileId: string;
  role: Role;
  email: string | null;
  member: SessionMember | null;
  /** True when the member must change their initial (NIK) password before continuing. */
  mustChangePassword: boolean;
};

/** Resolves the currently authenticated user from Supabase. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, email, must_change_password")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) return null;

  let member: SessionMember | null = null;
  if (profile.role === "anggota") {
    const { data: memberRow } = await admin
      .from("members")
      .select("id, member_number, full_name, nik, status")
      .eq("profile_id", profile.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (memberRow) {
      member = {
        id: memberRow.id,
        memberNumber: memberRow.member_number,
        fullName: memberRow.full_name,
        nik: memberRow.nik,
        status: memberRow.status
      };
    }
  }

  return {
    authUserId: user.id,
    profileId: profile.id,
    role: profile.role as Role,
    email: profile.email ?? user.email ?? null,
    member,
    mustChangePassword: Boolean(profile.must_change_password)
  };
}