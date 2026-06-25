import { attendances as demoAttendances, events as demoEvents } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { wibMonthStartUtc } from "@/lib/utils";

export type MemberAttendance = {
  id: string;
  attendedAt: string;
  method: "qr_code" | "manual";
  eventTitle: string;
  eventDate: string | null;
};

type AttendanceRow = {
  id: string;
  attended_at: string;
  method: "qr_code" | "manual";
  events: { title: string; date: string } | null;
};

function demoAttendancesFor(memberId: string): MemberAttendance[] {
  return demoAttendances
    .filter((attendance) => attendance.memberId === memberId)
    .map((attendance) => {
      const event = demoEvents.find((item) => item.id === attendance.eventId);
      return {
        id: attendance.id,
        attendedAt: attendance.attendedAt,
        method: attendance.method,
        eventTitle: event?.title ?? "Acara koperasi",
        eventDate: event?.date ?? null
      };
    });
}

/**
 * Attendance history for one member, newest first, joined with the event title
 * and date. Uses the service role with a server-trusted member id (from the
 * verified session), so it does not depend on the attendance RLS policy.
 */
export async function listMemberAttendances(memberId: string): Promise<MemberAttendance[]> {
  if (!isSupabaseConfigured()) return demoAttendancesFor(memberId);

  const admin = createSupabaseAdminClient();
  if (!admin) return demoAttendancesFor(memberId);

  const { data, error } = await admin
    .from("attendances")
    .select("id, attended_at, method, events(title, date)")
    .eq("member_id", memberId)
    .order("attended_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as AttendanceRow[]).map((row) => ({
    id: row.id,
    attendedAt: row.attended_at,
    method: row.method,
    eventTitle: row.events?.title ?? "Acara koperasi",
    eventDate: row.events?.date ?? null
  }));
}

/** Number of attendance records logged in the current calendar month. */
export async function countAttendancesThisMonth(): Promise<number> {
  const startOfMonth = wibMonthStartUtc();

  if (!isSupabaseConfigured()) {
    return demoAttendances.filter((attendance) => attendance.attendedAt >= startOfMonth).length;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return 0;

  const { count, error } = await admin
    .from("attendances")
    .select("id", { count: "exact", head: true })
    .gte("attended_at", startOfMonth);

  if (error) return 0;
  return count ?? 0;
}
