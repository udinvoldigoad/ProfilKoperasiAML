"use client";

import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Download, QrCode } from "lucide-react";

export function QrCodeCard({ token, title }: { token: string; title: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const scanUrl = useMemo(() => {
    if (typeof window === "undefined") return `/presensi/scan?token=${token}`;
    return `${window.location.origin}/presensi/scan?token=${token}`;
  }, [token]);

  useEffect(() => {
    QRCode.toDataURL(scanUrl, { margin: 2, width: 320, errorCorrectionLevel: "M" }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [scanUrl]);

  return (
    <div className="rounded-3xl border border-border-subtle bg-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
          <QrCode size={24} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <p className="text-sm text-on-surface-variant">QR berisi token random, bukan ID acara mentah.</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-border-subtle bg-white p-5">
        {dataUrl ? <img src={dataUrl} alt={`QR presensi ${title}`} className="h-80 w-80 max-w-full" /> : <p>Menyiapkan QR...</p>}
      </div>
      {dataUrl ? (
        <a
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white hover:bg-teal-dark"
          href={dataUrl}
          download={`qr-${token}.png`}
        >
          <Download size={18} aria-hidden="true" />
          Unduh QR
        </a>
      ) : null}
    </div>
  );
}
