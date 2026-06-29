import { cookies } from "next/headers";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
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

/** Resolves the currently authenticated user from the local signed session. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const claims = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!claims || !isDatabaseConfigured()) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: claims.profileId },
      include: { member: true }
    });

    if (!profile) return null;

    const member = profile.member && !profile.member.deletedAt
      ? {
          id: profile.member.id,
          memberNumber: profile.member.memberNumber,
          fullName: profile.member.fullName,
          nik: profile.member.nik,
          status: profile.member.status
        }
      : null;

    return {
      // Kept for compatibility with older call sites. Local auth uses profileId as the subject.
      authUserId: profile.authUserId ?? profile.id,
      profileId: profile.id,
      role: profile.role as Role,
      email: profile.email ?? null,
      member,
      mustChangePassword: profile.mustChangePassword
    };
  } catch {
    return null;
  }
}