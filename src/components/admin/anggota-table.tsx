"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Member } from "@/types";

const PAGE_SIZE = 30;

export function AnggotaTable({ members }: { members: Member[] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilters = (status ? 1 : 0) + (type ? 1 : 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        !q ||
        member.fullName.toLowerCase().includes(q) ||
        member.nik.includes(q) ||
        member.memberNumber.toLowerCase().includes(q);
      const matchesStatus = !status || member.status === status;
      const matchesType = !type || member.memberType === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [members, search, status, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageMembers = filtered.slice(start, start + PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = start + pageMembers.length;

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" aria-hidden="true" />
          <input
            className="min-h-11 w-full rounded-lg border border-border-subtle bg-white pl-10 pr-4 text-on-surface"
            placeholder="Cari nama, NIK, atau no anggota"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetToFirstPage();
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-white text-primary"
          aria-label="Filter anggota"
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          {activeFilters > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-container text-[10px] font-bold text-white">
              {activeFilters}
            </span>
          ) : null}
        </button>
      </div>

      {filterOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Filter Anggota</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-text hover:bg-surface-gray"
                aria-label="Tutup"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-primary">
                Status
                <select
                  className="min-h-11 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    resetToFirstPage();
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                  <option value="ditangguhkan">Ditangguhkan</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-primary">
                Tipe Anggota
                <select
                  className="min-h-11 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    resetToFirstPage();
                  }}
                >
                  <option value="">Semua Tipe</option>
                  <option value="anggota_lama">Anggota Lama</option>
                  <option value="anggota_baru">Anggota Baru</option>
                </select>
              </label>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatus("");
                  setType("");
                  resetToFirstPage();
                }}
                className="min-h-11 rounded-lg border border-border-subtle bg-white text-sm font-bold text-on-surface-variant hover:bg-surface-gray"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="min-h-11 rounded-lg bg-primary-container text-sm font-bold text-white"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-4">No Anggota</th>
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">NIK</th>
                <th className="px-5 py-4">Alamat</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Tipe</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pageMembers.map((member) => (
                <tr key={member.id} className="hover:bg-surface-gray">
                  <td className="px-5 py-4 font-bold text-primary">{member.memberNumber}</td>
                  <td className="px-5 py-4 font-bold">{member.fullName}</td>
                  <td className="px-5 py-4 text-muted-text">{member.nik}</td>
                  <td className="px-5 py-4 text-muted-text">{member.address}</td>
                  <td className="px-5 py-4">
                    <Badge tone={member.status === "aktif" ? "success" : member.status === "ditangguhkan" ? "warning" : "neutral"}>{member.status}</Badge>
                  </td>
                  <td className="px-5 py-4">{member.memberType === "anggota_baru" ? "Baru" : "Lama"}</td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary-container px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-teal-dark"
                      href={`/admin/anggota/${member.id}`}
                    >
                      <Eye size={15} aria-hidden="true" />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
              {pageMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-text">
                    Tidak ada anggota yang cocok dengan filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-4 text-sm text-muted-text md:flex-row md:items-center md:justify-between">
          <p>Menampilkan {from}-{to} dari {filtered.length} anggota</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={
                  p === currentPage
                    ? "h-11 w-11 rounded-lg border border-primary bg-primary-container font-bold text-white"
                    : "h-11 w-11 rounded-lg border border-border-subtle bg-white font-bold text-primary"
                }
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle bg-white font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
