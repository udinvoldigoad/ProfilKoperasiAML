"use client";

import { useRouter } from "next/navigation";
import { Ban, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useConfirm, useNotify } from "@/components/ui/notification";

export function EventCancelButton({ eventId, cancelled }: { eventId: string; cancelled: boolean }) {
  const router = useRouter();
  const notify = useNotify();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !cancelled;
    const ok = await confirm({
      title: next ? "Batalkan Acara" : "Aktifkan Kembali",
      message: next
        ? "Batalkan acara ini? QR presensi tidak akan aktif selama acara dibatalkan."
        : "Aktifkan kembali acara ini? Status akan mengikuti jadwal otomatis.",
      confirmLabel: next ? "Batalkan" : "Aktifkan",
      danger: next
    });
    if (!ok) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/acara/${eventId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelled: next })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal memperbarui status acara.");
        return;
      }
      notify(next ? "Acara berhasil dibatalkan." : "Acara berhasil diaktifkan kembali.");
      router.push(`/admin/acara/${eventId}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (cancelled) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-on-surface-variant">
          Acara ini berstatus <strong className="text-error">dibatalkan</strong>. QR presensi tidak aktif.
        </p>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary disabled:opacity-60"
        >
          <RotateCcw size={16} aria-hidden="true" />
          {loading ? "Memproses..." : "Aktifkan Kembali Acara"}
        </button>
        {error ? <span className="text-sm font-bold text-error">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-error/40 bg-white px-4 py-2 text-sm font-bold text-error disabled:opacity-60"
      >
        <Ban size={16} aria-hidden="true" />
        {loading ? "Memproses..." : "Batalkan Acara"}
      </button>
      {error ? <span className="text-sm font-bold text-error">{error}</span> : null}
    </div>
  );
}
