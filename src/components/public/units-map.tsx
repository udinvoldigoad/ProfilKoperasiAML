"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapUnit = {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string;
  mapsUrl?: string;
};

function gmapsUrl(unit: MapUnit) {
  return unit.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${unit.latitude},${unit.longitude}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function UnitsMap({ units }: { units: MapUnit[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const center: [number, number] = units.length
        ? [
            units.reduce((sum, unit) => sum + unit.latitude, 0) / units.length,
            units.reduce((sum, unit) => sum + unit.longitude, 0) / units.length
          ]
        : [-5.3133, 105.588];

      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const bounds: [number, number][] = [];

      units.forEach((unit, index) => {
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:flex;height:34px;width:34px;align-items:center;justify-content:center;border-radius:9999px;background:#ff841c;color:#fff;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.35);font-weight:800;font-size:14px">${index + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([unit.latitude, unit.longitude], { icon }).addTo(map!);
        bounds.push([unit.latitude, unit.longitude]);

        const photo = unit.photoUrl
          ? `<img src="${unit.photoUrl}" alt="${escapeHtml(unit.name)}" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px"/>`
          : "";

        marker.bindPopup(
          `<div style="width:228px;font-family:inherit">
            ${photo}
            <p style="margin:0;font-size:11px;font-weight:700;color:#964900;text-transform:uppercase;letter-spacing:.03em">${escapeHtml(unit.type)}</p>
            <h3 style="margin:2px 0 4px;font-size:15px;font-weight:800;color:#003b49">${escapeHtml(unit.name)}</h3>
            <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:#40484c">${escapeHtml(unit.description)}</p>
            <a href="${gmapsUrl(unit)}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:8px;background:#065366;color:#fff;font-size:12px;font-weight:800;text-decoration:none">Buka di Google Maps</a>
          </div>`
        );
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [units]);

  // zIndex:0 keeps Leaflet's internal panes below the sticky navbar (z-50).
  return <div ref={containerRef} className="h-[360px] w-full rounded-3xl border border-border-subtle sm:h-[440px]" style={{ zIndex: 0 }} />;
}
