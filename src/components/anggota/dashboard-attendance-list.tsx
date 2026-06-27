"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateID } from "@/lib/utils";
import type { MemberAttendance } from "@/lib/db/attendances";

const PAGE_SIZE = 3;

export function DashboardAttendanceList({ rows }: { rows: MemberAttendance[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const from = rows.length === 0 ? 0 : start + 1;
  const to = start + pageRows.length;

  return (
    <div className="mt-4 grid gap-3">
      {pageRows.length > 0 ? (
        pageRows.map((attendance) => (
          <div key={attendance.id} className="flex flex-col gap-2 rounded-2xl bg-surface-gray p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-primary">{attendance.eventTitle}</p>
              <p className="text-sm text-muted-text">{attendance.eventDate ? formatDateID(attendance.eventDate) : "-"}</p>
            </div>
            <Badge tone="success">Hadir</Badge>
          </div>
        ))
      ) : (
        <p className="rounded-2xl bg-surface-gray p-4 text-sm text-on-surface-variant">
          Belum ada riwayat kehadiran. Pindai QR presensi saat menghadiri acara untuk mulai mencatat kehadiran Anda.
        </p>
      )}

      {rows.length > PAGE_SIZE ? (
        <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
          <p>Menampilkan {from}-{to} dari {rows.length} riwayat</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={
                  item === currentPage
                    ? "h-10 w-10 rounded-lg border border-primary bg-primary-container font-bold text-white"
                    : "h-10 w-10 rounded-lg border border-border-subtle bg-white font-bold text-primary"
                }
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={currentPage === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
