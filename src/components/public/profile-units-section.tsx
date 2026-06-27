import { UnitDetailCards } from "@/components/public/unit-detail-cards";
import { UnitsMap, type MapLegendItem, type MapPoint } from "@/components/public/units-map";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { unitGroups } from "@/lib/data";

const CATEGORY_COLOR: Record<string, string> = {
  Saprotan: "#065366",
  "Distribusi Alpukat": "#ff841c",
  Bibit: "#964900",
  Patokan: "#60706b"
};

const LANDMARK_POINTS: MapPoint[] = [
  {
    id: "balai-desa-giri-mulyo",
    name: "Balai Desa Giri Mulyo",
    category: "Patokan",
    color: CATEGORY_COLOR.Patokan,
    address: "Patokan pusat desa untuk membaca jarak antarunit.",
    latitude: -5.3734584,
    longitude: 105.659684,
    kind: "landmark"
  }
];

function categoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? "#065366";
}

export function ProfileUnitsSection() {
  const unitPoints: MapPoint[] = unitGroups.flatMap((group) =>
    group.points.map((pt) => ({
      id: pt.id,
      name: pt.name,
      category: group.category,
      color: categoryColor(group.category),
      address: pt.address,
      latitude: pt.latitude,
      longitude: pt.longitude,
      landmark: pt.landmark,
      coverage: pt.coverage,
      place: pt.place,
      shippingArea: pt.shippingArea,
      manager: pt.manager,
      hours: pt.hours,
      contact: pt.contact,
      kind: "unit" as const
    }))
  );

  const mappedUnitPoints = unitPoints.filter(
    (point) => typeof point.latitude === "number" && typeof point.longitude === "number"
  );
  const mapPoints = [...mappedUnitPoints, ...LANDMARK_POINTS];
  const legend: MapLegendItem[] = [
    { label: "Saprotan", color: CATEGORY_COLOR.Saprotan, description: "Toko sarana produksi pertanian" },
    { label: "Gudang Alpukat", color: CATEGORY_COLOR["Distribusi Alpukat"], description: "Unit distribusi buah alpukat" },
    { label: "Jual Beli Bibit", color: CATEGORY_COLOR.Bibit, description: "Pengumpulan bibit dan sekretariat koperasi" },
    { label: "Patokan", color: CATEGORY_COLOR.Patokan, description: "Balai Desa Giri Mulyo" }
  ];

  return (
    <section id="unit" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Unit Koperasi"
          title="Peta unit usaha koperasi"
          description="Peta interaktif untuk melihat posisi Saprotan, Gudang Alpukat, Jual Beli Bibit, dan Balai Desa dalam satu tampilan."
        />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-primary">Peta Titik Unit</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Saprotan, Gudang Alpukat, Jual Beli Bibit, dan Balai Desa.</p>
          </div>
          <Badge tone="secondary">OpenStreetMap</Badge>
        </div>

        <div className="mt-4 grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)]">
          <UnitsMap points={mapPoints} legend={legend} showLegend={false} />

          <aside className="grid content-stretch gap-4 lg:h-[540px] lg:grid-rows-[auto_1fr]">
            <Card className="p-5">
              <h3 className="text-lg font-bold text-primary">Legenda Peta</h3>
              <div className="mt-4 grid gap-4">
                {legend.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white shadow" style={{ background: item.color }} />
                    <div>
                      <p className="font-bold text-primary">{item.label}</p>
                      <p className="text-sm leading-6 text-on-surface-variant">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-lg font-bold text-primary">Patokan Lokasi</h3>
              <div className="mt-4 grid gap-4 text-sm text-on-surface-variant">
                {LANDMARK_POINTS.map((point) => (
                  <div key={point.id}>
                    <p className="font-bold text-primary">{point.name}</p>
                    <p className="mt-1 leading-6">{point.address}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-primary">Detail Unit</h3>
              <p className="mt-1 text-sm text-on-surface-variant">Ringkasan unit ditampilkan ringkas, detail lengkap tersedia di modal.</p>
            </div>
            <Badge tone="neutral">{mappedUnitPoints.length} unit bertitik peta</Badge>
          </div>

          <UnitDetailCards groups={unitGroups} />
        </div>
      </div>
    </section>
  );
}
