"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/types";
import { formatDateID } from "@/lib/utils";

const PAGE_SIZE = 10;

export function RecentMembersTable({ members }: { members: Member[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(members.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageMembers = members.slice(start, start + PAGE_SIZE);
  const from = members.length === 0 ? 0 : start + 1;
  const to = start + pageMembers.length;

  return (
    <>
      <div className="mt-5 overflow-x-auto table-scroll">
        <table className="w-full min-w-[640px] text-left">
          <thead className="bg-surface-gray text-sm text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">No Anggota</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {pageMembers.length > 0 ? (
              pageMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-4 font-bold text-primary">{member.memberNumber}</td>
                  <td className="px-4 py-4">{member.fullName}</td>
                  <td className="px-4 py-4">
                    <Badge tone={member.status === "aktif" ? "success" : "neutral"}>{member.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-text">{formatDateID(member.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">
                  Belum ada anggota terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border-subtle px-1 pt-4 text-sm text-muted-text sm:flex-row sm:items-center sm:justify-between">
        <p>Menampilkan {from}-{to} dari {members.length} anggota</p>
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
    </>
  );
}
