"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export function EventActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Hapus acara ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/acara/${eventId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menghapus acara.");
        return;
      }
      router.push("/admin/acara");
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
        href={`/admin/acara/${eventId}/edit`}
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
