import Link from "next/link";
import { CalendarDays, FileUp, Megaphone, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listMembers } from "@/lib/db/members";
import { listEvents } from "@/lib/db/events";
import { countAttendancesThisMonth } from "@/lib/db/attendances";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDateID } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [members, events, presensiBulanIni] = await Promise.all([
    listMembers(),
    listEvents(),
    countAttendancesThisMonth()
  ]);

  const activeMembers = members.filter((member) => member.status === "aktif").length;
  const activeEvents = events.filter((event) => event.status === "aktif").length;

  // Same ordering as the member dashboard: active first, then nearest upcoming.
  const STATUS_RANK: Record<string, number> = { aktif: 0, draft: 1, selesai: 2, dibatalkan: 3 };
  const upcomingEvents = events
    .filter((event) => event.status !== "selesai" && event.status !== "dibatalkan")
    .sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) || a.date.localeCompare(b.date))
    .slice(0, 3);

  const recentMembers = [...members]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

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
              <h2 className="text-xl font-bold text-primary">Aksi Cepat</h2>
              <p className="text-sm text-on-surface-variant">Jalur paling sering dipakai operator desa.</p>
            </div>
            {!isSupabaseConfigured() ? <Badge tone="secondary">Mode demo lokal</Badge> : null}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["/admin/anggota/import", "Import Excel Anggota", FileUp],
              ["/admin/laporan", "Export Laporan", FileUp],
              ["/admin/pengumuman", "Kelola Pengumuman", Megaphone],
              ["/admin/acara", "Kelola Acara", CalendarDays]
            ].map(([href, label, Icon]) => (
              <Link key={String(href)} href={String(href)} className="flex min-h-16 items-center gap-3 rounded-2xl border border-border-subtle bg-surface-gray px-4 font-bold text-primary hover:bg-surface-container-low">
                <Icon size={22} aria-hidden="true" />
                {String(label)}
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-primary">Acara Terdekat</h2>
          <div className="mt-5 grid gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link key={event.id} href={`/admin/acara/${event.id}`} className="rounded-2xl border border-border-subtle bg-white p-4 hover:border-primary">
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
        <div className="mt-5 overflow-x-auto table-scroll">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">No Anggota</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentMembers.length > 0 ? (
                recentMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-4 font-bold text-primary">{member.memberNumber}</td>
                    <td className="px-4 py-4">{member.fullName}</td>
                    <td className="px-4 py-4">
                      <Badge tone={member.status === "aktif" ? "success" : "neutral"}>{member.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-text">{formatDateID(member.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                    Belum ada anggota terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
