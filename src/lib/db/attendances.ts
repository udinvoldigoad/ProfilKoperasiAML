import { attendances as fallbackAttendances, events as fallbackEvents } from "@/lib/data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { wibMonthStartUtc } from "@/lib/utils";

export type MemberAttendance = {
  id: string;
  attendedAt: string;
  method: "qr_code" | "manual";
  eventTitle: string;
  eventDate: string | null;
};

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function fallbackAttendancesFor(memberId: string): MemberAttendance[] {
  return fallbackAttendances
    .filter((attendance) => attendance.memberId === memberId)
    .map((attendance) => {
      const event = fallbackEvents.find((item) => item.id === attendance.eventId);
      return {
        id: attendance.id,
        attendedAt: attendance.attendedAt,
        method: attendance.method,
        eventTitle: event?.title ?? "Acara koperasi",
        eventDate: event?.date ?? null
      };
    });
}

/** Attendance history for one member, newest first. */
export async function listMemberAttendances(memberId: string): Promise<MemberAttendance[]> {
  if (!isDatabaseConfigured()) return fallbackAttendancesFor(memberId);

  try {
    const rows = await prisma.attendance.findMany({
      where: { memberId },
      include: { event: { select: { title: true, date: true } } },
      orderBy: { attendedAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      attendedAt: row.attendedAt.toISOString(),
      method: row.method,
      eventTitle: row.event?.title ?? "Acara koperasi",
      eventDate: row.event?.date ? dateOnly(row.event.date) : null
    }));
  } catch {
    return [];
  }
}

/** Number of attendance records logged in the current calendar month. */
export async function countAttendancesThisMonth(): Promise<number> {
  const startOfMonth = wibMonthStartUtc();

  if (!isDatabaseConfigured()) {
    return fallbackAttendances.filter((attendance) => attendance.attendedAt >= startOfMonth).length;
  }

  try {
    return await prisma.attendance.count({ where: { attendedAt: { gte: new Date(startOfMonth) } } });
  } catch {
    return 0;
  }
}