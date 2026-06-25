import type { Metadata } from "next";
import { ChevronRight, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { UnitsMap } from "@/components/public/units-map";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { listActiveUnits } from "@/lib/db/units";

export const metadata: Metadata = {
  title: "Unit Koperasi",
  description: "Empat unit usaha Koperasi Agri Mulyo Lestari beserta lokasi pada peta."
};

// Reads units from the DB, so it must reflect admin edits at request time.
export const dynamic = "force-dynamic";

export default async function UnitPage() {
  const units = await listActiveUnits();
  const mapUnits = units.map((unit) => ({
    id: unit.id,
    name: unit.name,
    type: unit.type,
    address: unit.address,
    latitude: unit.latitude,
    longitude: unit.longitude,
    description: unit.description,
    photoUrl: unit.photoUrl,
    mapsUrl: unit.mapsUrl
  }));

  return (
    <PublicShell>
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Unit Koperasi"
          title="Empat unit usaha yang melayani anggota dan warga"
          description="Klik titik bernomor pada peta untuk melihat nama unit, foto, deskripsi singkat, dan tautan langsung ke Google Maps."
        />

        <div className="mt-8">
          <UnitsMap units={mapUnits} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {units.map((unit, index) => (
            <Card key={unit.id} className="flex flex-col overflow-hidden p-0">
              {unit.photoUrl ? (
                <img src={unit.photoUrl} alt={unit.name} className="h-44 w-full object-cover" />
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <Badge tone="secondary">{unit.type}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold text-primary">{unit.name}</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-on-surface-variant">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
                  {unit.address}
                </p>
                <p className="mt-3 flex-1 text-sm text-on-surface-variant">{unit.description}</p>
                {unit.contact ? (
                  <p className="mt-3 flex items-center gap-2 text-sm font-bold text-primary">
                    <Phone size={16} aria-hidden="true" />
                    {unit.contact}
                  </p>
                ) : null}
                <ButtonLink href={`/unit/${unit.id}`} className="mt-4">
                  Lihat Detail
                  <ChevronRight size={16} aria-hidden="true" />
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
