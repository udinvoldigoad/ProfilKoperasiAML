import { Megaphone, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDateID } from "@/lib/utils";
import type { Announcement } from "@/types";

export function ProfileAnnouncementsSection({ announcements }: { announcements: Announcement[] }) {
  return (
    <section id="pengumuman" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pengumuman"
          title="Informasi resmi untuk anggota dan warga"
          description="Pengumuman kegiatan, layanan, dan agenda penting koperasi. Pengumuman terbaru tampil paling atas."
        />

        <div className="mt-8 grid gap-5">
          {announcements.length > 0 ? (
            announcements.slice(0, 4).map((item) => (
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
                    <h3 className="mt-2 text-xl font-bold text-primary">{item.title}</h3>
                    <p className="mt-2 text-on-surface-variant">{item.body}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Pengumuman resmi koperasi akan tampil di sini." />
          )}
        </div>
      </div>
    </section>
  );
}