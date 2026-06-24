"use client";

import { Download } from "lucide-react";
import { toCsv } from "@/lib/utils";

export function ExportButton({
  filename,
  rows,
  label = "Export CSV"
}: {
  filename: string;
  rows: Array<Record<string, string | number | null | undefined>>;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary-container hover:bg-surface-container-low"
      onClick={() => {
        const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }}
    >
      <Download size={18} aria-hidden="true" className="shrink-0" />
      {label}
    </button>
  );
}
