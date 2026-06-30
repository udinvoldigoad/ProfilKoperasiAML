import { stat } from "node:fs/promises";
import { join } from "node:path";
import { boardMembers as fallbackBoardMembers } from "@/lib/data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { profilePhotoFilenameFromUrl, profilePhotoUploadDirectory } from "@/lib/profile-photo-storage";
import type { BoardMember } from "@/types";

function normalizeBoardName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/^(bapak|pak|ibu|bu)\s+/i, "")
    .replace(/\s+/g, " ");
}

function inferLevel(position: string) {
  if (/ketua/i.test(position)) return 1;
  if (/pengawas/i.test(position)) return 3;
  return 2;
}

type BoardMemberRow = NonNullable<Awaited<ReturnType<typeof prisma.boardMember.findFirst>>>;

function mapBoardMemberRow(row: BoardMemberRow): BoardMember {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    photoUrl: row.photoUrl ?? "",
    contact: row.contact ?? undefined,
    period: row.period ?? undefined,
    level: inferLevel(row.position),
    sortOrder: row.sortOrder
  };
}

async function validBoardPhotoUrl(photoUrl?: string | null) {
  if (!photoUrl) return "";

  const filename = profilePhotoFilenameFromUrl(photoUrl);
  if (!filename) return photoUrl;

  try {
    const info = await stat(join(profilePhotoUploadDirectory(), filename));
    return info.isFile() ? photoUrl : "";
  } catch {
    return "";
  }
}

async function withValidBoardPhoto(member: BoardMember): Promise<BoardMember> {
  return {
    ...member,
    photoUrl: await validBoardPhotoUrl(member.photoUrl)
  };
}

export async function listBoardMembers(): Promise<BoardMember[]> {
  if (!isDatabaseConfigured()) return fallbackBoardMembers;

  try {
    const rows = await prisma.boardMember.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    if (rows.length === 0) return Promise.all(fallbackBoardMembers.map(withValidBoardPhoto));

    const rowsByName = new Map(rows.map((row) => [normalizeBoardName(row.name), row]));
    const defaultNames = new Set(fallbackBoardMembers.map((member) => normalizeBoardName(member.name)));

    const mergedDefaults = await Promise.all(fallbackBoardMembers.map(async (member) => {
      const row = rowsByName.get(normalizeBoardName(member.name));
      if (!row) return withValidBoardPhoto(member);

      return withValidBoardPhoto({
        ...member,
        id: row.id || member.id,
        name: row.name || member.name,
        position: row.position || member.position,
        photoUrl: row.photoUrl ?? member.photoUrl,
        contact: row.contact ?? member.contact,
        period: row.period ?? member.period,
        sortOrder: row.sortOrder ?? member.sortOrder
      });
    }));

    const extraRows = await Promise.all(
      rows.filter((row) => !defaultNames.has(normalizeBoardName(row.name))).map((row) => withValidBoardPhoto(mapBoardMemberRow(row)))
    );
    return [...mergedDefaults, ...extraRows];
  } catch {
    return fallbackBoardMembers;
  }
}

export async function updateBoardMemberPhotoByName(fullName: string, photoUrl: string) {
  if (!isDatabaseConfigured()) return false;

  const normalizedName = normalizeBoardName(fullName);
  const fallbackMatch = fallbackBoardMembers.find((member) => normalizeBoardName(member.name) === normalizedName);

  try {
    if (fallbackMatch) {
      await prisma.boardMember.upsert({
        where: { id: fallbackMatch.id },
        create: {
          id: fallbackMatch.id,
          name: fallbackMatch.name,
          position: fallbackMatch.position,
          photoUrl,
          contact: fallbackMatch.contact ?? null,
          period: fallbackMatch.period ?? null,
          sortOrder: fallbackMatch.sortOrder
        },
        update: { photoUrl }
      });
      return true;
    }

    const rows = await prisma.boardMember.findMany({ select: { id: true, name: true } });
    const matches = rows.filter((row) => normalizeBoardName(row.name) === normalizedName);
    await Promise.all(matches.map((row) => prisma.boardMember.update({ where: { id: row.id }, data: { photoUrl } })));
    return matches.length > 0;
  } catch {
    return false;
  }
}
