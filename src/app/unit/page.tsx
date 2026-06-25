import type { Metadata } from "next";
import { Clock3, ExternalLink, MapPin, Phone, UserRound } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { UnitsMap, type MapLegendItem, type MapPoint } from "@/components/public/units-map";
import { unitGroups } from "@/lib/data";

export const metadata: Metadata = {
  title: "Unit Koperasi",
  description: "Unit usaha Koperasi Agri Mulyo Lestari beserta titik lokasinya pada peta."
};

const CATEGORY_COLOR: Record<string, string> = {
  Saprotan: "#065366",
  "Distribusi Alpukat": "#ff841c",
  Bibit: "#964900"
};

function categoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? "#065366";
}

function gmaps(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export default function UnitPage() {
  const points: MapPoint[] = unitGroups.flatMap((group) =>
    group.points.map((pt) => ({
      id: pt.id,
      name: pt.name,
      category: group.category,
      color: categoryColor(group.category),
      address: pt.address,
      latitude: pt.latitude,
      longitude: pt.longitude
    }))
  );
  const legend: MapLegendItem[] = unitGroups
    .filter((group) => group.points.length > 0)
    .map((group) => ({ label: group.category, color: categoryColor(group.category) }));

  return (
    <PublicShell>
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Unit Koperasi"
          title="Unit usaha koperasi"
          description="Unit usaha koperasi beserta titik lokasinya. Sebagian unit memiliki beberapa titik layanan."
        />

        <div className="mt-8 grid gap-10">
          {unitGroups.map((group) => (
            <div key={group.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: categoryColor(group.category) }} />
                <Badge tone="secondary">{group.category}</Badge>
                {group.status === "menyusul" ? <Badge tone="neutral">Segera hadir</Badge> : null}
                {group.points.length > 1 ? (
                  <span className="text-sm font-bold text-muted-text">{group.points.length} titik lokasi</span>
                ) : null}
              </div>
              <h2 className="mt-2 text-2xl font-bold text-primary">{group.name}</h2>
              <p className="mt-1 max-w-2xl text-on-surface-variant">{group.description}</p>

              {group.points.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.points.map((pt) => (
                    <Card key={pt.id} className="flex flex-col">
                      <h3 className="text-lg font-bold text-primary">{pt.name}</h3>
                      <p className="mt-2 flex items-start gap-2 text-sm text-on-surface-variant">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
                        {pt.address}
                      </p>
                      {pt.landmark ? <p className="mt-1 pl-6 text-xs text-muted-text">Patokan: {pt.landmark}</p> : null}
                      <dl className="mt-3 grid gap-2 text-sm">
                        {pt.manager ? (
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <UserRound size={15} className="shrink-0 text-secondary" aria-hidden="true" />
                            <span>{pt.manager}</span>
                          </div>
                        ) : null}
                        {pt.hours ? (
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <Clock3 size={15} className="shrink-0 text-secondary" aria-hidden="true" />
                            <span>{pt.hours}</span>
                          </div>
                        ) : null}
                        {pt.contact ? (
                          <div className="flex items-center gap-2 font-bold text-primary">
                            <Phone size={15} className="shrink-0" aria-hidden="true" />
                            <span>{pt.contact}</span>
                          </div>
                        ) : null}
                      </dl>
                      <a
                        href={gmaps(pt.latitude, pt.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white transition hover:bg-teal-dark"
                      >
                        <ExternalLink size={16} aria-hidden="true" />
                        Buka di Google Maps
                      </a>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="mt-5">
                  <p className="text-on-surface-variant">Data lokasi unit ini sedang disiapkan dan akan segera ditampilkan.</p>
                </Card>
              )}
            </div>
          ))}
        </div>

        {points.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-primary">Lokasi Unit pada Peta</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Klik titik untuk melihat info & tautan Google Maps. Warna titik mengikuti kategori unit.
            </p>
            <div className="mt-5">
              <UnitsMap points={points} legend={legend} />
            </div>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
