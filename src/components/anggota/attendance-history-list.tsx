"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateID, formatDateTimeWIB } from "@/lib/utils";
import type { MemberAttendance } from "@/lib/db/attendances";

const PAGE_SIZE = 10;

export function AttendanceHistoryList({ rows }: { rows: MemberAttendance[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);
  const from = rows.length === 0 ? 0 : start + 1;
  const to = start + pageRows.length;

  const pagination = (
    <div className="flex flex-col gap-3 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
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
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:hidden">
        {pageRows.length > 0 ? (
          pageRows.map((attendance) => (
            <Card key={attendance.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-primary">{attendance.eventTitle}</p>
                <Badge tone={attendance.method === "qr_code" ? "success" : "secondary"}>
                  {attendance.method === "qr_code" ? "QR Code" : "Manual"}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="font-bold text-muted-text">Tanggal</dt>
                  <dd className="mt-0.5 text-on-surface">{attendance.eventDate ? formatDateID(attendance.eventDate) : "-"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-muted-text">Waktu Hadir</dt>
                  <dd className="mt-0.5 text-on-surface">{formatDateTimeWIB(attendance.attendedAt)}</dd>
                </div>
              </dl>
            </Card>
          ))
        ) : (
          <Card className="p-4">
            <p className="text-sm text-on-surface-variant">Belum ada riwayat kehadiran.</p>
          </Card>
        )}
      </div>

      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-4">Acara</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Waktu Hadir</th>
                <th className="px-5 py-4">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pageRows.length > 0 ? (
                pageRows.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-5 py-4 font-bold text-primary">{attendance.eventTitle}</td>
                    <td className="px-5 py-4">{attendance.eventDate ? formatDateID(attendance.eventDate) : "-"}</td>
                    <td className="px-5 py-4">{formatDateTimeWIB(attendance.attendedAt)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={attendance.method === "qr_code" ? "success" : "secondary"}>
                        {attendance.method === "qr_code" ? "QR Code" : "Manual"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    Belum ada riwayat kehadiran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination}
    </div>
  );
}
