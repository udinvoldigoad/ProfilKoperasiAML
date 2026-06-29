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

/** Attendance history for one member, newest first. */
export async function listMemberAttendances(memberId: string): Promise<MemberAttendance[]> {
  if (!isDatabaseConfigured()) return [];

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

/** Number of member and guest attendance records logged in the current calendar month. */
export async function countAttendancesThisMonth(): Promise<number> {
  const startOfMonth = wibMonthStartUtc();

  if (!isDatabaseConfigured()) return 0;

  try {
    const [members, guests] = await Promise.all([
      prisma.attendance.count({ where: { attendedAt: { gte: new Date(startOfMonth) } } }),
      prisma.guestAttendance.count({ where: { attendedAt: { gte: new Date(startOfMonth) } } })
    ]);
    return members + guests;
  } catch {
    return 0;
  }
}
