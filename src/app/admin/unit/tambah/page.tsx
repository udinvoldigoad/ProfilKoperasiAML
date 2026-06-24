import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { UnitForm } from "@/components/admin/unit-form";

export default function TambahUnitPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Tambah Unit" description="Tambahkan unit usaha baru beserta lokasi dan deskripsinya." />
      <Card>
        <UnitForm mode="create" />
      </Card>
    </div>
  );
}
