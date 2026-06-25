import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { getAnnouncement } from "@/lib/db/announcements";

export default async function EditPengumumanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Edit Pengumuman" description={announcement.title} />
      <Card>
        <AnnouncementForm
          mode="edit"
          announcementId={announcement.id}
          initial={{
            title: announcement.title,
            category: announcement.category,
            date: announcement.date,
            body: announcement.body,
            pinned: Boolean(announcement.pinned)
          }}
        />
      </Card>
    </div>
  );
}
