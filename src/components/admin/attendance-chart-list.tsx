"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatDateID } from "@/lib/utils";
import type { Event } from "@/types";

const PAGE_SIZE = 3;

type AttendanceChartItem = {
  event: Event;
  attended: number;
  total: number;
  percent: number;
};

export function AttendanceChartList({ items }: { items: AttendanceChartItem[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);
  const from = items.length === 0 ? 0 : start + 1;
  const to = start + pageItems.length;
  const hasPagination = items.length > PAGE_SIZE;

  return (
    <div className={hasPagination ? "mt-6 flex min-h-[430px] flex-col" : "mt-6"}>
      <div className="grid flex-1 content-start gap-4">
        {pageItems.length > 0 ? (
          pageItems.map((item) => (
            <div key={item.event.id} className="min-h-[108px] rounded-2xl border border-border-subtle bg-surface-gray p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-primary">{item.event.title}</p>
                  <p className="text-xs text-muted-text">{formatDateID(item.event.date)}</p>
                </div>
                <p className="text-sm font-extrabold text-primary">
                  {item.attended}/{item.total}
                </p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-primary-container" style={{ width: `${item.percent}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold text-muted-text">{item.percent}% hadir</p>
            </div>
          ))
        ) : (
          <p className="rounded-2xl bg-surface-gray p-4 text-sm text-on-surface-variant">
            Belum ada acara dengan data presensi.
          </p>
        )}
      </div>

      {hasPagination ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-border-subtle pt-4 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
          <p>Menampilkan {from}-{to} dari {items.length} acara</p>
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
