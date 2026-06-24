import Link from "next/link";
import { CalendarDays, FileUp, Newspaper, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { auditLogs, events, members } from "@/lib/data";
import { formatDateID, formatDateTimeWIB } from "@/lib/utils";

export default function AdminDashboardPage() {
  const activeMembers = members.filter((member) => member.status === "aktif").length;
  const activeEvents = events.filter((event) => event.status === "aktif").length;

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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Anggota", members.length, "Data anggota demo"],
          ["Anggota Aktif", activeMembers, "Peserta otomatis setiap acara"],
          ["Acara Aktif", activeEvents, "QR bisa digunakan"],
          ["Presensi Bulan Ini", "85%", "Target internal 80%"]
        ].map(([label, value, helper]) => (
          <Card key={String(label)}>
            <p className="text-sm font-bold text-muted-text">{label}</p>
            <p className="mt-3 text-3xl font-extrabold text-primary">{value}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{helper}</p>
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
            <Badge tone="secondary">Mode demo lokal</Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["/admin/anggota/import", "Import Excel Anggota", FileUp],
              ["/admin/laporan", "Export Laporan", FileUp],
              ["/admin/berita", "Kelola Berita", Newspaper],
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
            {events.slice(0, 2).map((event) => (
              <Link key={event.id} href={`/admin/acara/${event.id}`} className="rounded-2xl border border-border-subtle bg-white p-4 hover:border-primary">
                <Badge tone={event.status === "aktif" ? "success" : "neutral"}>{event.status}</Badge>
                <h3 className="mt-3 font-bold text-primary">{event.title}</h3>
                <p className="text-sm text-on-surface-variant">{formatDateID(event.date)} di {event.location}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-xl font-bold text-primary">Audit Log Terbaru</h2>
        <div className="mt-5 overflow-x-auto table-scroll">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Aktivitas</th>
                <th className="px-4 py-3">Entitas</th>
                <th className="px-4 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-4 font-bold text-primary">{log.actor}</td>
                  <td className="px-4 py-4">{log.summary}</td>
                  <td className="px-4 py-4">{log.entityType}</td>
                  <td className="px-4 py-4 text-sm text-muted-text">{formatDateTimeWIB(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
