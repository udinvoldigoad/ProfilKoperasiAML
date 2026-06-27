import Link from "next/link";
import { BarChart3, CalendarDays, UserPlus } from "lucide-react";
import { AttendanceChartList } from "@/components/admin/attendance-chart-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RecentMembersTable } from "@/components/admin/recent-members-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listMembers } from "@/lib/db/members";
import { getEventAttendanceRows, listEvents } from "@/lib/db/events";
import { countAttendancesThisMonth } from "@/lib/db/attendances";
import { formatDateID } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [members, events, presensiBulanIni] = await Promise.all([
    listMembers(),
    listEvents(),
    countAttendancesThisMonth()
  ]);

  const activeMembers = members.filter((member) => member.status === "aktif").length;
  const activeEvents = events.filter((event) => event.status === "aktif").length;

  const STATUS_RANK: Record<string, number> = { aktif: 0, draft: 1, selesai: 2, dibatalkan: 3 };
  const upcomingEvents = events
    .filter((event) => event.status !== "selesai" && event.status !== "dibatalkan")
    .sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || a.date.localeCompare(b.date))
    .slice(0, 3);

  const recentMembers = [...members].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const chartEvents = [...events]
    .filter((event) => event.status !== "draft" && event.status !== "dibatalkan")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);
  const attendanceChart = await Promise.all(
    chartEvents.map(async (event) => {
      const rows = await getEventAttendanceRows(event.id);
      const attended = rows.filter((row) => Boolean(row.attendedAt)).length;
      const total = rows.length || activeMembers;
      const percent = total > 0 ? Math.round((attended / total) * 100) : 0;
      return { event, attended, total, percent };
    })
  );

  const stats: Array<[string, string | number, string]> = [
    ["Total Anggota", members.length, "Terdaftar di koperasi"],
    ["Anggota Aktif", activeMembers, "Berstatus aktif"],
    ["Acara Aktif", activeEvents, "QR siap dipindai"],
    ["Presensi Bulan Ini", presensiBulanIni, "Kehadiran tercatat bulan ini"]
  ];

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Ringkasan Dashboard Admin"
        description="Pantau data anggota, acara aktif, presensi, dan aktivitas penting koperasi."
        actions={
          <>
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/anggota/tambah">
              <UserPlus size={18} aria-hidden="true" />
              Tambah Anggota
            </Link>
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary" href="/admin/acara/tambah">
              <CalendarDays size={18} aria-hidden="true" />
              Buat Acara
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 xl:grid-cols-4">
        {stats.map(([label, value, helper]) => (
          <Card key={label} className="p-4 sm:p-6">
            <p className="text-xs font-bold text-muted-text sm:text-sm">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-primary sm:mt-3 sm:text-3xl">{value}</p>
            <p className="mt-1 text-xs text-on-surface-variant sm:mt-2 sm:text-sm">{helper}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Grafik Kehadiran per Acara</h2>
              <p className="text-sm text-on-surface-variant">Jumlah hadir dibanding anggota aktif pada tiap acara.</p>
            </div>
            <BarChart3 size={28} className="text-secondary" aria-hidden="true" />
          </div>
          <AttendanceChartList items={attendanceChart} />
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-primary">Acara Terdekat</h2>
          <div className="mt-5 grid gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link key={event.id} href={`/admin/acara/${event.id}`} className="rounded-2xl border border-border-subtle bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-soft">
                  <Badge tone={event.status === "aktif" ? "success" : "warning"}>{event.status}</Badge>
                  <h3 className="mt-3 font-bold text-primary">{event.title}</h3>
                  <p className="text-sm text-on-surface-variant">{formatDateID(event.date)} di {event.location}</p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl bg-surface-gray p-4 text-sm text-on-surface-variant">
                Belum ada acara mendatang. <Link href="/admin/acara/tambah" className="font-bold text-primary">Buat acara</Link>.
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-bold text-primary">Anggota Terbaru</h2>
        <RecentMembersTable members={recentMembers} />
      </Card>
    </div>
  );
}
