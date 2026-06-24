import Link from "next/link";
import { MapPinPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UnitActions } from "@/components/admin/unit-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listUnits } from "@/lib/db/units";

export default async function AdminUnitPage() {
  const units = await listUnits();

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Manajemen Unit"
        description="Kelola nama unit, tipe, alamat, koordinat, kontak, dan status aktif."
        actions={
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/unit/tambah">
            <MapPinPlus size={18} aria-hidden="true" />
            Tambah Unit
          </Link>
        }
      />
      <div className="grid gap-5">
        {units.length > 0 ? (
          units.map((unit) => (
            <Card key={unit.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{unit.type}</Badge>
                  <Badge tone={unit.status === "aktif" ? "success" : "neutral"}>{unit.status}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold text-primary">{unit.name}</h2>
                <p className="text-on-surface-variant">{unit.address}</p>
                <p className="mt-2 text-sm text-muted-text">{unit.latitude}, {unit.longitude}</p>
              </div>
              <UnitActions unitId={unit.id} name={unit.name} />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-on-surface-variant">Belum ada unit. Klik <strong>Tambah Unit</strong> untuk menambahkan.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
