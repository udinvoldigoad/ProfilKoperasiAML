"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type ExportValue = string | number | boolean | null | undefined;
type ExportRow = Record<string, ExportValue>;

function titleFromKey(key: string) {
  const special: Record<string, string> = {
    nik: "NIK",
    nik_asal_instansi: "NIK / Asal-Instansi",
    no_anggota: "No Anggota",
    qr_code: "QR Code",
    waktu_hadir: "Waktu Hadir"
  };

  return (
    special[key] ??
    key
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function columnLetter(column: number) {
  let value = column;
  let letters = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters || "A";
}

function normalizeFilename(filename: string) {
  return `${filename.replace(/\.(csv|xlsx)$/i, "")}.xlsx`;
}

function normalizeValue(value: ExportValue) {
  return value ?? "";
}

function columnWidth(key: string, rows: ExportRow[]) {
  const longest = rows.reduce((max, row) => {
    const value = String(normalizeValue(row[key]));
    return Math.max(max, value.length);
  }, titleFromKey(key).length);
  return Math.min(Math.max(longest + 4, 14), 42);
}

export function ExportButton({
  filename,
  rows,
  label = "Export Excel"
}: {
  filename: string;
  rows: ExportRow[];
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Koperasi Agro Mulyo Lestari";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Data", {
        views: [{ state: "frozen", ySplit: 1 }]
      });
      const keys = rows.length > 0 ? Object.keys(rows[0]) : ["keterangan"];
      const dataRows = rows.length > 0 ? rows : [{ keterangan: "Tidak ada data" }];

      worksheet.columns = keys.map((key) => ({
        header: titleFromKey(key),
        key,
        width: columnWidth(key, dataRows)
      }));

      worksheet.addRows(
        dataRows.map((row) =>
          Object.fromEntries(keys.map((key) => [key, normalizeValue(row[key])]))
        )
      );

      const header = worksheet.getRow(1);
      header.height = 24;
      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF065366" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD6E3E7" } },
          left: { style: "thin", color: { argb: "FFD6E3E7" } },
          bottom: { style: "thin", color: { argb: "FFD6E3E7" } },
          right: { style: "thin", color: { argb: "FFD6E3E7" } }
        };
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.eachCell((cell) => {
          cell.alignment = { vertical: "top", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } }
          };
        });
      });

      worksheet.autoFilter = `A1:${columnLetter(keys.length)}1`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = normalizeFilename(filename);
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary-container hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleExport}
    >
      <Download size={18} aria-hidden="true" className="shrink-0" />
      {loading ? "Menyiapkan..." : label}
    </button>
  );
}
