import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default function TambahPengumumanPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Tambah Pengumuman" description="Pengumuman baru akan langsung tampil di halaman publik." />
      <Card>
        <AnnouncementForm mode="create" />
      </Card>
    </div>
  );
}
