import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { events } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default function AnggotaAcaraPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Daftar Acara</h1>
        <p className="mt-2 text-on-surface-variant">Semua anggota aktif otomatis menjadi peserta setiap acara.</p>
      </div>
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge tone={event.status === "aktif" ? "success" : event.status === "selesai" ? "neutral" : "warning"}>{event.status}</Badge>
              <h2 className="mt-3 text-xl font-bold text-primary">{event.title}</h2>
              <p className="text-on-surface-variant">{formatDateID(event.date)} pukul {event.startTime}-{event.endTime} WIB</p>
            </div>
            <Link className="min-h-11 rounded-lg bg-primary-container px-4 py-2 text-center text-sm font-bold text-white" href={`/anggota/acara/${event.id}`}>
              Detail
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
