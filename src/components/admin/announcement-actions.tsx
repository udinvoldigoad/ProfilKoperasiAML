"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useConfirm, useNotify } from "@/components/ui/notification";

export function AnnouncementActions({ announcementId, title }: { announcementId: string; title: string }) {
  const router = useRouter();
  const notify = useNotify();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = await confirm({
      title: "Hapus Pengumuman",
      message: `Hapus pengumuman "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus",
      danger: true
    });
    if (!ok) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pengumuman/${announcementId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus pengumuman.");
        return;
      }
      notify("Pengumuman berhasil dihapus.");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/pengumuman/${announcementId}/edit`}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary"
      >
        <Pencil size={16} aria-hidden="true" />
        Edit
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-error/40 bg-white px-4 py-2 text-sm font-bold text-error disabled:opacity-60"
      >
        <Trash2 size={16} aria-hidden="true" />
        {loading ? "Menghapus..." : "Hapus"}
      </button>
      {error ? <span className="text-sm font-bold text-error">{error}</span> : null}
    </div>
  );
}
