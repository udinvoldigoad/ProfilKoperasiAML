import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listEvents } from "@/lib/db/events";
import { formatDateID } from "@/lib/utils";

export default async function AdminAcaraPage() {
  const events = await listEvents();

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Manajemen Acara"
        description="Buat acara, aktifkan QR, lihat peserta otomatis dari anggota aktif, dan export presensi."
        actions={
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/acara/tambah">
            <CalendarPlus size={18} aria-hidden="true" />
            Buat Acara
          </Link>
        }
      />
      <div className="grid gap-5">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <Badge tone={event.status === "aktif" ? "success" : event.status === "selesai" ? "neutral" : "warning"}>{event.status}</Badge>
                <h2 className="mt-3 text-xl font-bold text-primary">{event.title}</h2>
                <p className="text-on-surface-variant">{formatDateID(event.date)} pukul {event.startTime}-{event.endTime} WIB, {event.location}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="min-h-11 rounded-lg border border-primary-container px-4 py-2 text-sm font-bold text-primary" href={`/admin/acara/${event.id}`}>
                  Detail
                </Link>
                {event.status !== "selesai" ? (
                  <Link className="min-h-11 rounded-lg border border-primary-container px-4 py-2 text-sm font-bold text-primary" href={`/admin/acara/${event.id}/edit`}>
                    Edit
                  </Link>
                ) : null}
                {event.status === "draft" || event.status === "aktif" ? (
                  <Link className="min-h-11 rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white" href={`/admin/acara/${event.id}/qr`}>
                    QR
                  </Link>
                ) : null}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-on-surface-variant">Belum ada acara. Klik <strong>Buat Acara</strong> untuk menambahkan.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
