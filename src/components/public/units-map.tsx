"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  name: string;
  category: string;
  color: string;
  address: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  coverage?: string;
  place?: string;
  shippingArea?: string;
  manager?: string;
  hours?: string;
  contact?: string;
  mapsUrl?: string;
  kind?: "unit" | "landmark";
};

export type MapLegendItem = { label: string; color: string; description?: string };

function hasCoordinates(point: MapPoint) {
  return typeof point.latitude === "number" && typeof point.longitude === "number";
}

function gmapsUrl(point: MapPoint) {
  if (point.mapsUrl) return point.mapsUrl;
  if (!hasCoordinates(point)) return null;
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function detailRow(label: string, value?: string) {
  if (!value) return "";
  return `<p style="margin:0;font-size:12px;line-height:1.45;color:#40484c"><strong style="color:#003b49">${label}:</strong> ${escapeHtml(value)}</p>`;
}

function markerHtml(point: MapPoint) {
  const size = point.kind === "landmark" ? 26 : 36;
  const inner = point.kind === "landmark" ? 8 : 10;
  const radius = point.kind === "landmark" ? 9 : 9999;
  return `<span style="display:grid;place-items:center;height:${size}px;width:${size}px;border-radius:${radius}px;background:${point.color};border:3px solid #fff;box-shadow:0 12px 28px rgba(0,0,0,.28)"><span style="height:${inner}px;width:${inner}px;border-radius:9999px;background:#fff"></span></span>`;
}

export function UnitsMap({
  points,
  legend,
  showLegend = true
}: {
  points: MapPoint[];
  legend?: MapLegendItem[];
  showLegend?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const mappablePoints = points.filter(hasCoordinates);
      if (mappablePoints.length === 0) {
        if (!cancelled) setLoadError("Belum ada titik koordinat untuk ditampilkan.");
        return;
      }

      setLoadError(null);

      const center = mappablePoints.reduce(
        (acc, point) => ({
          lat: acc.lat + point.latitude! / mappablePoints.length,
          lng: acc.lng + point.longitude! / mappablePoints.length
        }),
        { lat: 0, lng: 0 }
      );

      map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      L.control.scale({ metric: true, imperial: false }).addTo(map);

      const latLngs = mappablePoints.map((point) => L.latLng(point.latitude!, point.longitude!));

      mappablePoints.forEach((point) => {
        const size = point.kind === "landmark" ? 26 : 36;
        const icon = L.divIcon({
          className: "",
          html: markerHtml(point),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)]
        });

        const mapsHref = gmapsUrl(point);
        const mapsButton = mapsHref
          ? `<a href="${mapsHref}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;min-height:38px;border-radius:8px;background:#065366;color:#fff;font-size:12px;font-weight:800;text-decoration:none">Buka di Google Maps</a>`
          : "";

        const details = [
          detailRow("Jarak", point.landmark),
          detailRow("Radius", point.coverage),
          detailRow("Tempat", point.place),
          detailRow("Pengiriman", point.shippingArea),
          detailRow("Penanggung jawab", point.manager),
          detailRow("Jam", point.hours),
          detailRow("No HP", point.contact)
        ].join("");

        L.marker([point.latitude!, point.longitude!], { icon })
          .addTo(map!)
          .bindPopup(
            `<div style="width:250px;font-family:inherit">
              <p style="margin:0;font-size:11px;font-weight:800;color:${point.color};text-transform:uppercase;letter-spacing:.03em">${escapeHtml(point.category)}</p>
              <h3 style="margin:2px 0 4px;font-size:16px;font-weight:900;color:#003b49">${escapeHtml(point.name)}</h3>
              <p style="margin:0 0 9px;font-size:12px;line-height:1.5;color:#40484c">${escapeHtml(point.address)}</p>
              <div style="display:grid;gap:3px;margin-bottom:11px">${details}</div>
              ${mapsButton}
            </div>`
          );
      });

      map.fitBounds(L.latLngBounds(latLngs), { padding: [44, 44], maxZoom: 16 });
    })().catch(() => {
      if (!cancelled) setLoadError("Peta gagal disiapkan.");
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points]);

  return (
    <div>
      {showLegend && legend && legend.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white shadow" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
      {loadError ? <p className="mb-3 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm font-bold text-error">{loadError}</p> : null}
      {/* zIndex:0 keeps Leaflet's panes below the sticky navbar (z-50). */}
      <div
        ref={containerRef}
        className="h-[430px] w-full overflow-hidden rounded-2xl border border-border-subtle bg-[#eaf2eb] shadow-soft sm:h-[540px]"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
