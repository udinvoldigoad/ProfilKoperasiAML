"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

export type PdfReportData = {
  koperasiName: string;
  summary: { total: number; aktif: number; acara: number };
  members: Array<{ no: string; nama: string; status: string }>;
  events: Array<{ acara: string; tanggal: string; hadir: number; total: number }>;
};

export function PdfReportButton({ data }: { data: PdfReportData }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTableMod = await import("jspdf-autotable");
      const autoTable = (autoTableMod.default ?? (autoTableMod as { autoTable?: typeof autoTableMod.default }).autoTable)!;

      const doc = new jsPDF();
      const finalY = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0;

      doc.setFontSize(16);
      doc.text(data.koperasiName, 14, 18);
      doc.setFontSize(11);
      doc.text("Laporan Ringkas Koperasi", 14, 25);
      doc.setFontSize(9);
      doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 31);

      autoTable(doc, {
        startY: 38,
        head: [["Ringkasan", "Jumlah"]],
        body: [
          ["Total Anggota", String(data.summary.total)],
          ["Anggota Aktif", String(data.summary.aktif)],
          ["Jumlah Acara", String(data.summary.acara)]
        ],
        headStyles: { fillColor: [6, 83, 102] }
      });

      let y = finalY() + 10;
      doc.setFontSize(12);
      doc.text("Daftar Anggota", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["No Anggota", "Nama", "Status"]],
        body: data.members.map((m) => [m.no, m.nama, m.status]),
        headStyles: { fillColor: [6, 83, 102] }
      });

      y = finalY() + 10;
      doc.setFontSize(12);
      doc.text("Rekap Presensi per Acara", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["Acara", "Tanggal", "Hadir", "Total"]],
        body: data.events.map((e) => [e.acara, e.tanggal, String(e.hadir), String(e.total)]),
        headStyles: { fillColor: [6, 83, 102] }
      });

      doc.save("laporan-koperasi.pdf");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <FileDown size={18} aria-hidden="true" />}
      {loading ? "Menyiapkan..." : "Unduh PDF"}
    </button>
  );
}
