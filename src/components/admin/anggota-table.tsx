"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-primary">
            Cari
            <input
              className="min-h-11 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
              placeholder="Nama, NIK, atau no anggota"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
            />
          </label>
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
      </Card>

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
                    <Link className="font-bold text-primary hover:underline" href={`/admin/anggota/${member.id}`}>
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
