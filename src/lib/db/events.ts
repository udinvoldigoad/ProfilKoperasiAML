import type { Event, EventStatus } from "@/types";
import { eventEndToUtc, resolveEventStatus } from "@/lib/utils";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function dateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

type DbEvent = Awaited<ReturnType<typeof prisma.event.findFirst>>;

function mapEventRow(row: NonNullable<DbEvent>): Event {
  const date = dateOnly(row.date);
  const startTime = row.startTime?.slice(0, 5) ?? row.startTime;
  const endTime = row.endTime?.slice(0, 5) ?? row.endTime;
  return {
    id: row.id,
    title: row.title,
    date,
    startTime,
    endTime,
    location: row.location,
    description: row.description ?? "",
    status: resolveEventStatus(date, startTime, endTime, row.status) as EventStatus,
    qrToken: row.qrToken ?? "",
    qrExpiresAt: row.qrExpiresAt?.toISOString() ?? ""
  };
}

function newQrToken() {
  return `evt_${globalThis.crypto.randomUUID().replace(/-/g, "")}`;
}

/** All events (admin view, includes draft/selesai), newest date first. */
export async function listEvents(): Promise<Event[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { date: "desc" }
    });
    return rows.map(mapEventRow);
  } catch {
    return [];
  }
}

/** Single event by id (admin/service role). */
export async function getEvent(id: string): Promise<Event | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const row = await prisma.event.findFirst({ where: { id, deletedAt: null } });
    return row ? mapEventRow(row) : null;
  } catch {
    return null;
  }
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

/** Creates an event with a fresh random QR token and computed expiry (WIB to UTC). */
export async function createEvent(input: EventInput, createdBy?: string): Promise<CreateEventResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi (DATABASE_URL)." };

  try {
    const event = await prisma.event.create({
      data: {
        title: input.title,
        date: dateInput(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        description: input.description ?? "",
        status: resolveEventStatus(input.date, input.startTime, input.endTime, input.status) as EventStatus,
        qrToken: newQrToken(),
        qrExpiresAt: new Date(eventEndToUtc(input.date, input.endTime)),
        createdBy: createdBy ?? null
      },
      select: { id: true }
    });
    return { ok: true, id: event.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menyimpan acara." };
  }
}

/** Updates an event. QR expiry is recomputed from the (possibly new) date/end time. */
export async function updateEvent(id: string, input: EventInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title: input.title,
        date: dateInput(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        description: input.description ?? "",
        status: resolveEventStatus(input.date, input.startTime, input.endTime, input.status) as EventStatus,
        qrExpiresAt: new Date(eventEndToUtc(input.date, input.endTime))
      }
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal memperbarui acara." };
  }
}

/** Cancels or reinstates an event. */
export async function setEventCancelled(id: string, cancelled: boolean): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    let nextStatus: EventStatus = "dibatalkan";
    if (!cancelled) {
      const event = await prisma.event.findFirst({ where: { id, deletedAt: null } });
      if (!event) return { ok: false, error: "Acara tidak ditemukan." };
      const date = dateOnly(event.date);
      nextStatus = resolveEventStatus(date, event.startTime.slice(0, 5), event.endTime.slice(0, 5)) as EventStatus;
    }

    await prisma.event.update({ where: { id }, data: { status: nextStatus } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal mengubah status acara." };
  }
}

/** Soft-deletes an event. */
export async function softDeleteEvent(id: string): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menghapus acara." };
  }
}

export type EventAttendanceRow = {
  memberId: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  attendedAt: string | null;
};

/** Active members with their attendance status for one event (present + absent). */
export async function getEventAttendanceRows(eventId: string): Promise<EventAttendanceRow[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const [members, attendances] = await Promise.all([
      prisma.member.findMany({
        where: { status: "aktif", deletedAt: null },
        select: { id: true, memberNumber: true, fullName: true, nik: true },
        orderBy: [{ memberType: "asc" }, { memberNumber: "asc" }]
      }),
      prisma.attendance.findMany({
        where: { eventId },
        select: { memberId: true, attendedAt: true }
      })
    ]);

    const attendedAtByMember = new Map(attendances.map((row) => [row.memberId, row.attendedAt.toISOString()]));

    return members.map((member) => ({
      memberId: member.id,
      memberNumber: member.memberNumber,
      fullName: member.fullName,
      nik: member.nik,
      attendedAt: attendedAtByMember.get(member.id) ?? null
    }));
  } catch {
    return [];
  }
}