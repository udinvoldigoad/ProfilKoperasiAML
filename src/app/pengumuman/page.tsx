import type { Metadata } from "next";
import { Megaphone, Pin } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { listAnnouncements } from "@/lib/db/announcements";
import { formatDateID } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pengumuman",
  description: "Pengumuman resmi Koperasi Agri Mulyo Lestari."
};

// Reads announcements from the DB, so it must reflect admin edits at request time.
export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  const sorted = await listAnnouncements();

  return (
    <PublicShell>
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Pengumuman"
          title="Informasi resmi untuk anggota dan warga"
          description="Pengumuman kegiatan, layanan, dan agenda penting koperasi. Pengumuman terbaru tampil paling atas."
        />

        <div className="mt-8 grid gap-5">
          {sorted.length > 0 ? (
            sorted.map((item) => (
              <Card key={item.id} className={item.pinned ? "border-secondary-container" : undefined}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      item.pinned ? "bg-secondary-container text-white" : "bg-surface-container-low text-primary"
                    }`}
                  >
                    <Megaphone size={22} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={item.pinned ? "secondary" : "primary"}>{item.category}</Badge>
                      {item.pinned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-secondary">
                          <Pin size={13} aria-hidden="true" />
                          Penting
                        </span>
                      ) : null}
                      <span className="text-sm text-muted-text">{formatDateID(item.date)}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-primary">{item.title}</h2>
                    <p className="mt-2 text-on-surface-variant">{item.body}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-on-surface-variant">Belum ada pengumuman saat ini.</p>
            </Card>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
