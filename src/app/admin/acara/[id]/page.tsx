import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EventActions } from "@/components/admin/event-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getEvent, getEventAttendanceRows } from "@/lib/db/events";
import { formatDateID, formatDateTimeWIB } from "@/lib/utils";

export default async function DetailAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const rows = await getEventAttendanceRows(event.id);
  const present = rows.filter((row) => row.attendedAt).length;

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title={event.title}
        description="Semua anggota aktif otomatis menjadi peserta. Kehadiran dihitung dari tabel attendances."
        actions={
          <>
            <Link className="min-h-11 rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white" href={`/admin/acara/${event.id}/qr`}>
              Generate QR
            </Link>
            <Link className="min-h-11 rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary" href={`/admin/acara/${event.id}/presensi`}>
              Rekap Presensi
            </Link>
            <EventActions eventId={event.id} />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <Badge tone={event.status === "aktif" ? "success" : "neutral"}>{event.status}</Badge>
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="text-sm font-bold text-muted-text">Tanggal</dt>
              <dd className="font-bold text-primary">{formatDateID(event.date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-muted-text">Waktu</dt>
              <dd className="font-bold text-primary">{event.startTime}-{event.endTime} WIB</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-muted-text">Lokasi</dt>
              <dd className="font-bold text-primary">{event.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-muted-text">QR kedaluwarsa</dt>
              <dd className="font-bold text-primary">{formatDateTimeWIB(event.qrExpiresAt)}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-primary">Ringkasan Presensi</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-surface-gray p-4">
              <p className="text-sm font-bold text-muted-text">Peserta</p>
              <p className="text-3xl font-extrabold text-primary">{rows.length}</p>
            </div>
            <div className="rounded-2xl bg-green-100 p-4">
              <p className="text-sm font-bold text-green-800">Hadir</p>
              <p className="text-3xl font-extrabold text-green-900">{present}</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-4">
              <p className="text-sm font-bold text-amber-800">Tidak Hadir</p>
              <p className="text-3xl font-extrabold text-amber-900">{rows.length - present}</p>
            </div>
          </div>
          {event.description ? <p className="mt-5 text-on-surface-variant">{event.description}</p> : null}
        </Card>
      </div>
    </div>
  );
}
