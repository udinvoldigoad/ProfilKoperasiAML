import type { Member, MemberStatus, MemberType } from "@/types";
import { hashPassword } from "@/lib/passwords";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function dateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

type DbMember = Awaited<ReturnType<typeof prisma.member.findFirst>>;

function mapMemberRow(row: NonNullable<DbMember>): Member {
  return {
    id: row.id,
    profileId: row.profileId ?? "",
    memberNumber: row.memberNumber,
    fullName: row.fullName,
    nik: row.nik,
    birthPlace: row.birthPlace,
    birthDate: dateOnly(row.birthDate),
    address: row.address,
    photoUrl: row.photoUrl ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    status: row.status as MemberStatus,
    memberType: row.memberType as MemberType,
    createdAt: row.createdAt.toISOString()
  };
}

function memberTypeRank(type: MemberType) {
  return type === "anggota_lama" ? 0 : 1;
}

function memberNumberRank(value: string) {
  const numeric = parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
}

function sortMembers(list: Member[]) {
  return [...list].sort((a, b) => {
    const typeDiff = memberTypeRank(a.memberType) - memberTypeRank(b.memberType);
    if (typeDiff !== 0) return typeDiff;

    const numberDiff = memberNumberRank(a.memberNumber) - memberNumberRank(b.memberNumber);
    if (numberDiff !== 0) return numberDiff;

    return a.memberNumber.localeCompare(b.memberNumber, "id", { numeric: true, sensitivity: "base" });
  });
}

async function nextMemberNumber(memberType: MemberType) {
  const rows = await prisma.member.findMany({
    where: { memberType, deletedAt: null },
    select: { memberNumber: true }
  });

  const max = rows.reduce((highest, row) => {
    const value = parseInt(row.memberNumber, 10);
    return Number.isFinite(value) && value > highest ? value : highest;
  }, 0);

  return String(max + 1);
}

/** All active (non-deleted) members from MySQL. */
export async function listMembers(): Promise<Member[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.member.findMany({
      where: { deletedAt: null },
      orderBy: [{ memberType: "asc" }, { memberNumber: "asc" }]
    });
    return sortMembers(rows.map(mapMemberRow));
  } catch {
    return [];
  }
}

/** Single member by id from MySQL. */
export async function getMember(id: string): Promise<Member | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const row = await prisma.member.findFirst({ where: { id, deletedAt: null } });
    return row ? mapMemberRow(row) : null;
  } catch {
    return null;
  }
}

/** Full member fetch for a server-trusted id (e.g. the logged-in member's own id). */
export async function getMemberForSession(id: string): Promise<Member | null> {
  return getMember(id);
}

export type CreateMemberInput = {
  /** Optional; left blank, the next sequential number for this member type is assigned. */
  memberNumber?: string;
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

/** Creates a local profile login and the member row. Default password = NIK. */
export async function createMember(input: CreateMemberInput): Promise<CreateMemberResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Database MySQL belum dikonfigurasi (DATABASE_URL)." };
  }

  try {
    const memberNumber = input.memberNumber?.trim() || (await nextMemberNumber(input.memberType));

    const existingNik = await prisma.member.findFirst({ where: { nik: input.nik, deletedAt: null }, select: { id: true } });
    if (existingNik) return { ok: false, error: "NIK sudah terdaftar." };

    const existingNumber = await prisma.member.findFirst({
      where: { memberType: input.memberType, memberNumber, deletedAt: null },
      select: { id: true }
    });
    if (existingNumber) return { ok: false, error: "No Anggota untuk tipe anggota ini sudah terdaftar." };

    const member = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          role: "anggota",
          email: input.email?.toLowerCase() || null,
          phone: input.phone ?? null,
          passwordHash: hashPassword(input.nik),
          mustChangePassword: true
        }
      });

      return tx.member.create({
        data: {
          profileId: profile.id,
          memberNumber,
          fullName: input.fullName,
          nik: input.nik,
          birthPlace: input.birthPlace,
          birthDate: dateInput(input.birthDate),
          address: input.address,
          email: input.email || null,
          phone: input.phone || null,
          status: input.status,
          memberType: input.memberType
        },
        select: { id: true }
      });
    });

    return { ok: true, id: member.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan data anggota.";
    if (/Unique constraint|duplicate|P2002/i.test(message)) return { ok: false, error: "Data anggota sudah terdaftar." };
    return { ok: false, error: message };
  }
}

export async function updateMemberFromImportByNik(input: CreateMemberInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    const existing = await prisma.member.findUnique({
      where: { nik: input.nik },
      select: { id: true, profileId: true }
    });
    if (!existing) return { ok: false, error: "NIK belum terdaftar." };

    const memberNumber = input.memberNumber?.trim();
    if (memberNumber) {
      const numberOwner = await prisma.member.findFirst({
        where: {
          memberType: input.memberType,
          memberNumber,
          deletedAt: null,
          NOT: { id: existing.id }
        },
        select: { id: true }
      });
      if (numberOwner) return { ok: false, error: "No Anggota untuk tipe anggota ini sudah dipakai anggota lain." };
    }

    await prisma.member.update({
      where: { id: existing.id },
      data: {
        ...(memberNumber ? { memberNumber } : {}),
        fullName: input.fullName,
        birthPlace: input.birthPlace,
        birthDate: dateInput(input.birthDate),
        address: input.address,
        email: input.email || null,
        phone: input.phone || null,
        memberType: input.memberType,
        status: input.status,
        deletedAt: null,
        ...(existing.profileId
          ? {
              profile: {
                update: {
                  email: input.email?.toLowerCase() || null,
                  phone: input.phone || null
                }
              }
            }
          : {})
      }
    });

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui anggota dari import.";
    if (/Unique constraint|duplicate|P2002/i.test(message)) return { ok: false, error: "Data anggota bentrok dengan anggota lain." };
    return { ok: false, error: message };
  }
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
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.member.update({
      where: { id },
      data: {
        fullName: input.fullName,
        birthPlace: input.birthPlace,
        birthDate: dateInput(input.birthDate),
        address: input.address,
        email: input.email || null,
        phone: input.phone || null,
        memberType: input.memberType,
        status: input.status,
        profile: {
          update: {
            email: input.email?.toLowerCase() || null,
            phone: input.phone || null
          }
        }
      }
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui anggota." };
  }
}

export type UpdateMemberProfileInput = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone?: string;
};

/** Self-service profile update for the logged-in member. */
export async function updateMemberProfile(id: string, input: UpdateMemberProfileInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.member.update({
      where: { id },
      data: {
        fullName: input.fullName,
        birthPlace: input.birthPlace,
        birthDate: dateInput(input.birthDate),
        address: input.address,
        phone: input.phone || null,
        profile: { update: { phone: input.phone || null } }
      }
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui profil." };
  }
}

export async function updateMemberPhoto(id: string, photoUrl: string): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.member.update({ where: { id }, data: { photoUrl } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui foto profil." };
  }
}

/** Soft-deletes a member: sets deleted_at and marks the row nonaktif. */
export async function softDeleteMember(id: string): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.member.update({ where: { id }, data: { deletedAt: new Date(), status: "nonaktif" } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menonaktifkan anggota." };
  }
}

export type ResetPasswordResult = { ok: true; password: string } | { ok: false; error: string };

/** Resets a member's login password back to their NIK. Returns the new password. */
export async function resetMemberPassword(id: string): Promise<ResetPasswordResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    const member = await prisma.member.findUnique({ where: { id }, include: { profile: true } });
    if (!member || member.deletedAt) return { ok: false, error: "Anggota tidak ditemukan." };
    if (!member.profile) return { ok: false, error: "Anggota belum punya akun login." };

    await prisma.profile.update({
      where: { id: member.profile.id },
      data: { passwordHash: hashPassword(member.nik), mustChangePassword: true }
    });

    return { ok: true, password: member.nik };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal reset password." };
  }
}

/** Changes a member's own password and clears the forced-change flag. */
export async function changeMemberPassword(
  memberId: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    const member = await prisma.member.findUnique({ where: { id: memberId }, include: { profile: true } });
    if (!member || member.deletedAt) return { ok: false, error: "Anggota tidak ditemukan." };
    if (newPassword === member.nik) return { ok: false, error: "Password baru tidak boleh sama dengan NIK." };
    if (!member.profile) return { ok: false, error: "Anggota belum punya akun login." };

    await prisma.profile.update({
      where: { id: member.profile.id },
      data: { passwordHash: hashPassword(newPassword), mustChangePassword: false }
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal mengganti password." };
  }
}
