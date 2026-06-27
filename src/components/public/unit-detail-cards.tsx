"use client";

import { Clock3, ExternalLink, MapPin, Phone, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { UnitGroup, UnitPoint } from "@/types";

const CATEGORY_COLOR: Record<string, string> = {
  Saprotan: "#065366",
  "Distribusi Alpukat": "#ff841c",
  Bibit: "#964900"
};

type SelectedUnit = {
  group: UnitGroup;
  point: UnitPoint;
};

function categoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? "#065366";
}

function unitLabel(group: UnitGroup) {
  if (group.id === "alpukat") return "Gudang Distribusi Alpukat";
  if (group.id === "bibit") return "Pengumpulan Bibit / Sekretariat Koperasi AML";
  return group.type;
}

function gmaps(point: UnitPoint) {
  if (typeof point.latitude !== "number" || typeof point.longitude !== "number") return null;
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}

function coordinates(point: UnitPoint) {
  if (typeof point.latitude !== "number" || typeof point.longitude !== "number") return null;
  return `${point.latitude}, ${point.longitude}`;
}

function detailRows(group: UnitGroup, point: UnitPoint) {
  return [
    { label: "Unit", value: unitLabel(group) },
    { label: "Alamat", value: point.address },
    { label: "Jarak dari Balai Desa", value: point.landmark },
    { label: "Radius", value: point.coverage },
    { label: "Tempat", value: point.place },
    { label: "Pengiriman", value: point.shippingArea },
    { label: "Penanggung jawab", value: point.manager },
    { label: "Jam operasional", value: point.hours },
    { label: "No HP", value: point.contact },
    { label: "Koordinat", value: coordinates(point) ?? undefined }
  ].filter((item) => Boolean(item.value));
}

function summaryValue(value?: string) {
  return value && value.trim().length > 0 ? value : "Belum dicantumkan";
}

export function UnitDetailCards({ groups }: { groups: UnitGroup[] }) {
  const [selected, setSelected] = useState<SelectedUnit | null>(null);
  const mapsHref = selected ? gmaps(selected.point) : null;

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3">
        {groups.map((group) => {
          const point = group.points[0];
          if (!point) return null;
          const markerColor = categoryColor(group.category);
          const rows = [
            { label: "Penanggung jawab", value: summaryValue(point.manager), icon: UserRound },
            { label: "Nomor telepon", value: summaryValue(point.contact), icon: Phone },
            { label: "Jam operasional", value: summaryValue(point.hours), icon: Clock3 },
            { label: "Lokasi", value: summaryValue(point.address), icon: MapPin }
          ];

          return (
            <Card key={group.id} className="flex h-full flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ background: markerColor }} />
                <div className="min-w-0">
                  <h3 className="text-xl font-bold leading-tight text-primary">{group.name}</h3>
                  <p className="mt-1 text-sm font-extrabold text-secondary">{unitLabel(group)}</p>
                </div>
              </div>

              <div className="mt-5 grid flex-1 gap-3 text-sm">
                {rows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="grid grid-cols-[1.75rem_1fr] gap-2 rounded-2xl bg-surface-gray p-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-muted-text">{item.label}</p>
                        <p className="mt-0.5 break-words font-bold leading-6 text-on-surface-variant">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setSelected({ group, point })}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary-container px-4 text-sm font-bold text-white transition hover:bg-teal-dark"
              >
                Lihat Detail
              </button>
            </Card>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border-subtle bg-white px-5 py-4 sm:px-6">
              <div>
                <Badge tone="secondary">{selected.group.category}</Badge>
                <h2 className="mt-2 text-xl font-extrabold leading-tight text-primary">{selected.group.name}</h2>
                <p className="mt-1 text-sm font-bold text-secondary">{unitLabel(selected.group)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-primary hover:bg-surface-gray"
                aria-label="Tutup detail unit"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-7 text-on-surface-variant">{selected.group.description}</p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {detailRows(selected.group, selected.point).map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border-subtle bg-surface-gray p-4">
                    <dt className="text-xs font-bold uppercase text-muted-text">{item.label}</dt>
                    <dd className="mt-1 break-words font-bold leading-6 text-primary">{item.value}</dd>
                  </div>
                ))}
              </dl>

              {mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white transition hover:bg-teal-dark"
                >
                  <ExternalLink size={17} aria-hidden="true" />
                  Lihat di Google Maps
                </a>
              ) : (
                <p className="mt-6 rounded-lg bg-surface-container-low px-4 py-3 text-center text-sm font-bold text-muted-text">
                  Detail lokasi menyusul.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
