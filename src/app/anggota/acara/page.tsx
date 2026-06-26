import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listEvents } from "@/lib/db/events";
import { formatDateID } from "@/lib/utils";

// Active first, then upcoming (nearest date), then finished (most recent).
const STATUS_RANK: Record<string, number> = { aktif: 0, draft: 1, selesai: 2, dibatalkan: 3 };

export default async function AnggotaAcaraPage() {
  // Members see upcoming (draft), ongoing (aktif), and past (selesai) events — never cancelled ones.
  const events = (await listEvents())
    .filter((event) => event.status !== "dibatalkan")
    .sort((a, b) => {
      const rank = (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9);
      if (rank !== 0) return rank;
      // Upcoming: nearest date first; otherwise newest first.
      return a.status === "draft" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Daftar Acara</h1>
        <p className="mt-2 text-on-surface-variant">Semua anggota aktif otomatis menjadi peserta setiap acara.</p>
      </div>
      <div className="grid gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <Badge tone={event.status === "aktif" ? "success" : event.status === "selesai" ? "neutral" : "warning"}>
                  {event.status === "draft" ? "akan datang" : event.status}
                </Badge>
                <h2 className="mt-3 text-xl font-bold text-primary">{event.title}</h2>
                <p className="text-on-surface-variant">{formatDateID(event.date)} pukul {event.startTime}-{event.endTime} WIB</p>
              </div>
              <Link className="min-h-11 rounded-lg bg-primary-container px-4 py-2 text-center text-sm font-bold text-white" href={`/anggota/acara/${event.id}`}>
                Detail
              </Link>
            </Card>
          ))
        ) : (
          <EmptyState icon={CalendarDays} title="Belum ada acara" description="Acara koperasi yang akan datang muncul di sini." />
        )}
      </div>
    </div>
  );
}
