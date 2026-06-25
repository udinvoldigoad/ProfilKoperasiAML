import type { BoardMember } from "@/types";
import { boardMembers as demoBoardMembers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteUploadedImage } from "@/lib/db/storage";

type BoardMemberRow = {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  contact: string | null;
  period: string | null;
  sort_order: number;
};

const BOARD_COLUMNS = "id, name, position, photo_url, contact, period, sort_order";

function mapRow(row: BoardMemberRow): BoardMember {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    photoUrl: row.photo_url ?? "",
    contact: row.contact ?? undefined,
    period: row.period ?? undefined,
    sortOrder: row.sort_order
  };
}

function sortByOrder(list: BoardMember[]): BoardMember[] {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** All board members ordered by sort_order. Falls back to demo data when unconfigured. */
export async function listBoardMembers(): Promise<BoardMember[]> {
  if (!isSupabaseConfigured()) return sortByOrder(demoBoardMembers);

  const admin = createSupabaseAdminClient();
  if (!admin) return sortByOrder(demoBoardMembers);

  const { data, error } = await admin
    .from("board_members")
    .select(BOARD_COLUMNS)
    .order("sort_order", { ascending: true });

  if (error || !data) return sortByOrder(demoBoardMembers);
  return (data as BoardMemberRow[]).map(mapRow);
}

/** Single board member by id (admin/service role). */
export async function getBoardMember(id: string): Promise<BoardMember | null> {
  if (!isSupabaseConfigured()) {
    return demoBoardMembers.find((person) => person.id === id) ?? null;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return demoBoardMembers.find((person) => person.id === id) ?? null;

  const { data, error } = await admin.from("board_members").select(BOARD_COLUMNS).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return mapRow(data as BoardMemberRow);
}

export type BoardMemberInput = {
  name: string;
  position: string;
  photoUrl?: string;
  contact?: string;
  period?: string;
  sortOrder: number;
};

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };
export type MutationResult = { ok: true } | { ok: false; error: string };

function toRow(input: BoardMemberInput) {
  return {
    name: input.name,
    position: input.position,
    photo_url: input.photoUrl || null,
    contact: input.contact || null,
    period: input.period || null,
    sort_order: input.sortOrder
  };
}

export async function createBoardMember(input: BoardMemberInput): Promise<CreateResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };

  const { data, error } = await admin.from("board_members").insert(toRow(input)).select("id").single();

  if (error || !data) return { ok: false, error: error?.message ?? "Gagal menyimpan pengurus." };
  return { ok: true, id: data.id };
}

export async function updateBoardMember(id: string, input: BoardMemberInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { data: existing } = await admin.from("board_members").select("photo_url").eq("id", id).maybeSingle();
  const { error } = await admin.from("board_members").update(toRow(input)).eq("id", id);

  if (error) return { ok: false, error: error.message };

  // Free the old photo if it was replaced or removed.
  const oldPhoto = (existing as { photo_url: string | null } | null)?.photo_url;
  if (oldPhoto && oldPhoto !== (input.photoUrl || null)) await deleteUploadedImage(oldPhoto);

  return { ok: true };
}

export async function deleteBoardMember(id: string): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { data: existing } = await admin.from("board_members").select("photo_url").eq("id", id).maybeSingle();
  const { error } = await admin.from("board_members").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  await deleteUploadedImage((existing as { photo_url: string | null } | null)?.photo_url);
  return { ok: true };
}
