import type { Announcement } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function dateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

type DbAnnouncement = Awaited<ReturnType<typeof prisma.announcement.findFirst>>;

function mapRow(row: NonNullable<DbAnnouncement>): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    date: dateOnly(row.date),
    pinned: row.pinned
  };
}

/** Pinned first, then newest date first. */
function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return a.date < b.date ? 1 : -1;
  });
}

/** All announcements (admin + public share the same set) from MySQL. */
export async function listAnnouncements(): Promise<Announcement[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.announcement.findMany({ orderBy: [{ pinned: "desc" }, { date: "desc" }] });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

/** Single announcement by id. */
export async function getAnnouncement(id: string): Promise<Announcement | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const row = await prisma.announcement.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  } catch {
    return null;
  }
}

export type AnnouncementInput = {
  title: string;
  body: string;
  category: string;
  date: string;
  pinned: boolean;
};

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };
export type MutationResult = { ok: true } | { ok: false; error: string };

export async function createAnnouncement(input: AnnouncementInput): Promise<CreateResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi (DATABASE_URL)." };

  try {
    const row = await prisma.announcement.create({
      data: { ...input, date: dateInput(input.date) },
      select: { id: true }
    });
    return { ok: true, id: row.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menyimpan pengumuman." };
  }
}

export async function updateAnnouncement(id: string, input: AnnouncementInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.announcement.update({ where: { id }, data: { ...input, date: dateInput(input.date) } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui pengumuman." };
  }
}

export async function deleteAnnouncement(id: string): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.announcement.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menghapus pengumuman." };
  }
}