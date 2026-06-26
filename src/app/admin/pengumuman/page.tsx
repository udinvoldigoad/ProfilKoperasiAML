import Link from "next/link";
import { Megaphone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AnnouncementActions } from "@/components/admin/announcement-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listAnnouncements } from "@/lib/db/announcements";
import { formatDateID } from "@/lib/utils";

export default async function AdminPengumumanPage() {
  const announcements = await listAnnouncements();

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Manajemen Pengumuman"
        description="Kelola judul, isi, kategori, tanggal, dan status sematan pengumuman koperasi."
        actions={
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/pengumuman/tambah">
            <Megaphone size={18} aria-hidden="true" />
            Tambah Pengumuman
          </Link>
        }
      />
      <div className="grid gap-4">
        {announcements.length > 0 ? (
          announcements.map((item) => (
            <Card key={item.id} className={`grid gap-4 md:grid-cols-[1fr_auto] md:items-start ${item.pinned ? "border-secondary-container" : ""}`}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.category}</Badge>
                  {item.pinned ? <Badge tone="secondary">Penting</Badge> : null}
                  <span className="text-sm text-muted-text">{formatDateID(item.date)}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-primary">{item.title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant line-clamp-3">{item.body}</p>
              </div>
              <AnnouncementActions announcementId={item.id} title={item.title} />
            </Card>
          ))
        ) : (
          <EmptyState icon={Megaphone} title="Belum ada pengumuman" description="Klik Tambah Pengumuman untuk membuat yang pertama." />
        )}
      </div>
    </div>
  );
}
