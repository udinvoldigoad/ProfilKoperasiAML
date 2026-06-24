import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getEventById } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default async function DetailAcaraAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  return (
    <div className="grid gap-6">
      <Card>
        <Badge tone={event.status === "aktif" ? "success" : "neutral"}>{event.status}</Badge>
        <h1 className="mt-4 text-3xl font-extrabold text-primary">{event.title}</h1>
        <p className="mt-3 text-on-surface-variant">{event.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-surface-gray p-4">
            <p className="text-sm font-bold text-muted-text">Tanggal</p>
            <p className="font-bold text-primary">{formatDateID(event.date)}</p>
          </div>
          <div className="rounded-2xl bg-surface-gray p-4">
            <p className="text-sm font-bold text-muted-text">Waktu</p>
            <p className="font-bold text-primary">{event.startTime}-{event.endTime} WIB</p>
          </div>
          <div className="rounded-2xl bg-surface-gray p-4">
            <p className="text-sm font-bold text-muted-text">Lokasi</p>
            <p className="font-bold text-primary">{event.location}</p>
          </div>
        </div>
        {event.status === "aktif" ? (
          <Link className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-primary-container px-5 text-sm font-bold text-white" href="/presensi/scan">
            Scan QR Presensi
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
