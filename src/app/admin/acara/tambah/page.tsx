import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";

export default function TambahAcaraPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Buat Acara" description="Tanggal dan jam disimpan dengan zona WIB. QR presensi dibuat otomatis dengan token unik." />
      <Card>
        <EventForm mode="create" />
      </Card>
    </div>
  );
}
