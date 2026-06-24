import type { Event, EventStatus } from "@/types";
import {
  attendances as demoAttendances,
  events as demoEvents,
  members as demoMembers
} from "@/lib/data";
import { eventEndToUtc } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type EventRow = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string | null;
  status: EventStatus;
  qr_token: string;
  qr_expires_at: string;
};

const EVENT_COLUMNS =
  "id, title, date, start_time, end_time, location, description, status, qr_token, qr_expires_at";

function mapEventRow(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    startTime: row.start_time?.slice(0, 5) ?? row.start_time,
    endTime: row.end_time?.slice(0, 5) ?? row.end_time,
    location: row.location,
    description: row.description ?? "",
    status: row.status,
    qrToken: row.qr_token,
    qrExpiresAt: row.qr_expires_at
  };
}

function newQrToken() {
  return `evt_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

/** All events (admin view, includes draft/selesai), newest date first. */
export async function listEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return demoEvents;

  const admin = createSupabaseAdminClient();
  if (!admin) return demoEvents;

  const { data, error } = await admin
    .from("events")
    .select(EVENT_COLUMNS)
    .is("deleted_at", null)
    .order("date", { ascending: false });

  if (error || !data) return demoEvents;
  return (data as EventRow[]).map(mapEventRow);
}

/** Single event by id (admin/service role). */
export async function getEvent(id: string): Promise<Event | null> {
  if (!isSupabaseConfigured()) {
    return demoEvents.find((event) => event.id === id) ?? null;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return demoEvents.find((event) => event.id === id) ?? null;

  const { data, error } = await admin
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapEventRow(data as EventRow);
}

export type EventInput = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  status: EventStatus;
};

export type CreateEventResult = { ok: true; id: string } | { ok: false; error: string };
export type MutationResult = { ok: true } | { ok: false; error: string };

/** Creates an event with a fresh random QR token and computed expiry (WIB→UTC). */
export async function createEvent(input: EventInput, createdBy?: string): Promise<CreateEventResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };

  const { data, error } = await admin
    .from("events")
    .insert({
      title: input.title,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      location: input.location,
      description: input.description ?? null,
      status: input.status,
      qr_token: newQrToken(),
      qr_expires_at: eventEndToUtc(input.date, input.endTime),
      created_by: createdBy ?? null
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Gagal menyimpan acara." };
  return { ok: true, id: data.id };
}

/** Updates an event. QR expiry is recomputed from the (possibly new) date/end time. */
export async function updateEvent(id: string, input: EventInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin
    .from("events")
    .update({
      title: input.title,
      date: input.date,
      start_time: input.startTime,
      end_time: input.endTime,
      location: input.location,
      description: input.description ?? null,
      status: input.status,
      qr_expires_at: eventEndToUtc(input.date, input.endTime)
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Soft-deletes an event. */
export async function softDeleteEvent(id: string): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi." };

  const { error } = await admin
    .from("events")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type EventAttendanceRow = {
  memberId: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  attendedAt: string | null;
};

type AttendanceRow = { member_id: string; attended_at: string };
type MemberLite = { id: string; member_number: string; full_name: string; nik: string };

/**
 * Active members with their attendance status for one event (present + absent),
 * sorted by member number. Used by the event detail summary and presensi report.
 */
export async function getEventAttendanceRows(eventId: string): Promise<EventAttendanceRow[]> {
  if (!isSupabaseConfigured()) {
    return demoMembers
      .filter((member) => member.status === "aktif")
      .map((member) => {
        const attendance = demoAttendances.find((item) => item.eventId === eventId && item.memberId === member.id);
        return {
          memberId: member.id,
          memberNumber: member.memberNumber,
          fullName: member.fullName,
          nik: member.nik,
          attendedAt: attendance?.attendedAt ?? null
        };
      });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const [{ data: members }, { data: attendanceData }] = await Promise.all([
    admin
      .from("members")
      .select("id, member_number, full_name, nik")
      .eq("status", "aktif")
      .is("deleted_at", null)
      .order("member_number", { ascending: true }),
    admin.from("attendances").select("member_id, attended_at").eq("event_id", eventId)
  ]);

  if (!members) return [];
  const attendedAtByMember = new Map((attendanceData as AttendanceRow[] | null)?.map((row) => [row.member_id, row.attended_at]) ?? []);

  return (members as MemberLite[]).map((member) => ({
    memberId: member.id,
    memberNumber: member.member_number,
    fullName: member.full_name,
    nik: member.nik,
    attendedAt: attendedAtByMember.get(member.id) ?? null
  }));
}
