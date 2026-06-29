import type { Announcement } from "@/types";
import { announcements as fallbackAnnouncements } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  category: string;
  date: string;
  pinned: boolean;
};

const ANNOUNCEMENT_COLUMNS = "id, title, body, category, date, pinned";

function mapRow(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    date: row.date,
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

/** All announcements (admin + public share the same set). Falls back to local seed data. */
export async function listAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured()) return sortAnnouncements(fallbackAnnouncements);

  const admin = createSupabaseAdminClient();
  if (!admin) return sortAnnouncements(fallbackAnnouncements);

  const { data, error } = await admin
    .from("announcements")
    .select(ANNOUNCEMENT_COLUMNS)
    .order("pinned", { ascending: false })
    .order("date", { ascending: false });

  if (error || !data) return sortAnnouncements(fallbackAnnouncements);
  return (data as AnnouncementRow[]).map(mapRow);
}

/** Single announcement by id (admin/service role). */
export async function getAnnouncement(id: string): Promise<Announcement | null> {
  if (!isSupabaseConfigured()) {
    return fallbackAnnouncements.find((item) => item.id === id) ?? null;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return fallbackAnnouncements.find((item) => item.id === id) ?? null;

  const { data, error } = await admin.from("announcements").select(ANNOUNCEMENT_COLUMNS).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return mapRow(data as AnnouncementRow);
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

function toRow(input: AnnouncementInput) {
  return {
    title: input.title,
    body: input.body,
    category: input.category,
    date: input.date,
    pinned: input.pinned
  };
}

export async function createAnnouncement(input: AnnouncementInput): Promise<CreateResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };

  const { data, error } = await admin.from("announcements").insert(toRow(input)).select("id").single();

  if (error || !data) return { ok: false, error: error?.message ?? "Gagal menyimpan pengumuman." };
  return { ok: true, id: data.id };
}

export async function updateAnnouncement(id: string, input: AnnouncementInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin.from("announcements").update(toRow(input)).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin.from("announcements").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
