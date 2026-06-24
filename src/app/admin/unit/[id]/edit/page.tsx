import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { UnitForm } from "@/components/admin/unit-form";
import { getUnit } from "@/lib/db/units";

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = await getUnit(id);
  if (!unit) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Edit Unit" description={unit.name} />
      <Card>
        <UnitForm
          mode="edit"
          unitId={unit.id}
          initial={{
            name: unit.name,
            type: unit.type,
            address: unit.address,
            latitude: String(unit.latitude),
            longitude: String(unit.longitude),
            contact: unit.contact ?? "",
            description: unit.description,
            photoUrl: unit.photoUrl ?? "",
            mapsUrl: unit.mapsUrl ?? "",
            status: unit.status
          }}
        />
      </Card>
    </div>
  );
}
