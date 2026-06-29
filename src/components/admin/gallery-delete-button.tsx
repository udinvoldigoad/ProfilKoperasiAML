"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useConfirm, useNotify } from "@/components/ui/notification";

export function GalleryDeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const approved = await confirm({
      title: "Hapus Foto?",
      message: `Foto "${title}" akan dihapus dari galeri publik dan storage hosting.`,
      confirmLabel: "Hapus",
      cancelLabel: "Batal",
      danger: true
    });
    if (!approved) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/galeri/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        window.alert(data.error ?? "Gagal menghapus foto galeri.");
        return;
      }
      notify("Foto galeri berhasil dihapus.");
      router.refresh();
    } catch {
      window.alert("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 text-xs font-bold text-error transition hover:bg-error hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} aria-hidden="true" />
      {loading ? "Menghapus..." : "Hapus Foto"}
    </button>
  );
}
