"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  name: string;
  category: string;
  color: string;
  address: string;
  latitude: number;
  longitude: number;
  mapsUrl?: string;
};

export type MapLegendItem = { label: string; color: string };

function gmapsUrl(point: MapPoint) {
  return point.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function UnitsMap({ points, legend }: { points: MapPoint[]; legend?: MapLegendItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || points.length === 0) return;

      const center: [number, number] = [
        points.reduce((sum, p) => sum + p.latitude, 0) / points.length,
        points.reduce((sum, p) => sum + p.longitude, 0) / points.length
      ];

      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      const bounds: [number, number][] = [];

      points.forEach((point) => {
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;height:22px;width:22px;border-radius:9999px;background:${point.color};border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.35)"></span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12]
        });

        const marker = L.marker([point.latitude, point.longitude], { icon }).addTo(map!);
        bounds.push([point.latitude, point.longitude]);

        marker.bindPopup(
          `<div style="width:220px;font-family:inherit">
            <p style="margin:0;font-size:11px;font-weight:700;color:${point.color};text-transform:uppercase;letter-spacing:.03em">${escapeHtml(point.category)}</p>
            <h3 style="margin:2px 0 4px;font-size:15px;font-weight:800;color:#003b49">${escapeHtml(point.name)}</h3>
            <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:#40484c">${escapeHtml(point.address)}</p>
            <a href="${gmapsUrl(point)}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:8px;background:#065366;color:#fff;font-size:12px;font-weight:800;text-decoration:none">Buka di Google Maps</a>
          </div>`
        );
      });

      if (bounds.length > 1) map.fitBounds(bounds, { padding: [60, 60] });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points]);

  return (
    <div>
      {legend && legend.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white shadow" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {/* zIndex:0 keeps Leaflet's panes below the sticky navbar (z-50). */}
      <div ref={containerRef} className="h-[360px] w-full rounded-3xl border border-border-subtle sm:h-[440px]" style={{ zIndex: 0 }} />
    </div>
  );
}
