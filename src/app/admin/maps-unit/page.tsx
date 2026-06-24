import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { units } from "@/lib/data";

export default function AdminMapsUnitPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Manajemen Maps Unit" description="Kelola nama unit, tipe, alamat, koordinat, kontak, dan status aktif." />
      <div className="grid gap-5">
        {units.map((unit) => (
          <Card key={unit.id} className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Badge>{unit.type}</Badge>
              <h2 className="mt-3 text-xl font-bold text-primary">{unit.name}</h2>
              <p className="text-on-surface-variant">{unit.address}</p>
              <p className="mt-2 text-sm text-muted-text">{unit.latitude}, {unit.longitude}</p>
            </div>
            <Badge tone={unit.status === "aktif" ? "success" : "neutral"}>{unit.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
