import type { Unit } from "@/types";
import { units as demoUnits } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type UnitRow = {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  contact: string | null;
  description: string | null;
  photo_url: string | null;
  maps_url: string | null;
  status: "aktif" | "nonaktif";
};

const UNIT_COLUMNS = "id, name, type, address, latitude, longitude, contact, description, photo_url, maps_url, status";

function mapRow(row: UnitRow): Unit {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    contact: row.contact ?? undefined,
    description: row.description ?? "",
    photoUrl: row.photo_url ?? undefined,
    mapsUrl: row.maps_url ?? undefined,
    status: row.status
  };
}

/** All units (admin view, includes nonaktif), oldest first. Falls back to demo data. */
export async function listUnits(): Promise<Unit[]> {
  if (!isSupabaseConfigured()) return demoUnits;

  const admin = createSupabaseAdminClient();
  if (!admin) return demoUnits;

  const { data, error } = await admin
    .from("units")
    .select(UNIT_COLUMNS)
    .order("created_at", { ascending: true });

  if (error || !data) return demoUnits;
  return (data as UnitRow[]).map(mapRow);
}

/** Only active units, for the public site and map. */
export async function listActiveUnits(): Promise<Unit[]> {
  const all = await listUnits();
  return all.filter((unit) => unit.status === "aktif");
}

/** Single unit by id (admin/service role). */
export async function getUnit(id: string): Promise<Unit | null> {
  if (!isSupabaseConfigured()) {
    return demoUnits.find((unit) => unit.id === id) ?? null;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return demoUnits.find((unit) => unit.id === id) ?? null;

  const { data, error } = await admin.from("units").select(UNIT_COLUMNS).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return mapRow(data as UnitRow);
}

export type UnitInput = {
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact?: string;
  description: string;
  photoUrl?: string;
  mapsUrl?: string;
  status: "aktif" | "nonaktif";
};

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };
export type MutationResult = { ok: true } | { ok: false; error: string };

function toRow(input: UnitInput) {
  return {
    name: input.name,
    type: input.type,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    contact: input.contact || null,
    description: input.description,
    photo_url: input.photoUrl || null,
    maps_url: input.mapsUrl || null,
    status: input.status
  };
}

export async function createUnit(input: UnitInput): Promise<CreateResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };

  const { data, error } = await admin.from("units").insert(toRow(input)).select("id").single();

  if (error || !data) return { ok: false, error: error?.message ?? "Gagal menyimpan unit." };
  return { ok: true, id: data.id };
}

export async function updateUnit(id: string, input: UnitInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin.from("units").update(toRow(input)).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteUnit(id: string): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin.from("units").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
