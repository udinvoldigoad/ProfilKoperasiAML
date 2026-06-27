"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeWIB } from "@/lib/utils";
import type { AuditLog } from "@/types";

const PAGE_SIZE = 10;

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageLogs = logs.slice(start, start + PAGE_SIZE);
  const from = logs.length === 0 ? 0 : start + 1;
  const to = start + pageLogs.length;

  return (
    <>
      <div className="overflow-x-auto table-scroll">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-surface-gray text-sm text-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Aktor</th>
              <th className="px-5 py-4">Aksi</th>
              <th className="px-5 py-4">Entitas</th>
              <th className="px-5 py-4">Ringkasan</th>
              <th className="px-5 py-4">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {pageLogs.length > 0 ? (
              pageLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 font-bold text-primary">{log.actor}</td>
                  <td className="px-5 py-4"><Badge tone="secondary">{log.action}</Badge></td>
                  <td className="px-5 py-4">{log.entityType}</td>
                  <td className="px-5 py-4">{log.summary}</td>
                  <td className="px-5 py-4 text-sm text-muted-text">{formatDateTimeWIB(log.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">
                  Belum ada aktivitas tercatat. Aksi admin (tambah/ubah/hapus anggota & acara) akan muncul di sini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-4 text-sm text-muted-text md:flex-row md:items-center md:justify-between">
        <p>Menampilkan {from}-{to} dari {logs.length} log</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Halaman sebelumnya"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
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
                  ? "h-11 w-11 rounded-lg border border-primary bg-primary-container font-bold text-white"
                  : "h-11 w-11 rounded-lg border border-border-subtle bg-white font-bold text-primary"
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
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
