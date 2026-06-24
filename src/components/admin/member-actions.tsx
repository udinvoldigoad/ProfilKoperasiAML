"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export function MemberActions({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "reset" | "delete">(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleReset() {
    if (!confirm("Reset password anggota ini ke NIK?")) return;
    setMessage(null);
    setBusy("reset");
    try {
      const response = await fetch(`/api/admin/anggota/${memberId}/reset-password`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Gagal reset password." });
        return;
      }
      setMessage({ type: "ok", text: `Password direset ke: ${data.password}` });
    } catch {
      setMessage({ type: "error", text: "Tidak dapat terhubung ke server." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Nonaktifkan (soft delete) anggota ini? Data presensi tetap tersimpan.")) return;
    setMessage(null);
    setBusy("delete");
    try {
      const response = await fetch(`/api/admin/anggota/${memberId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Gagal menghapus anggota." });
        return;
      }
      router.push("/admin/anggota");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Tidak dapat terhubung ke server." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/anggota/${memberId}/edit`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary"
        >
          <Pencil size={18} aria-hidden="true" />
          Edit
        </Link>
        <button
          type="button"
          onClick={handleReset}
          disabled={busy !== null}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          <KeyRound size={18} aria-hidden="true" />
          {busy === "reset" ? "Memproses..." : "Reset Password"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy !== null}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-error/40 bg-white px-4 text-sm font-bold text-error disabled:opacity-60"
        >
          <Trash2 size={18} aria-hidden="true" />
          {busy === "delete" ? "Memproses..." : "Nonaktifkan"}
        </button>
      </div>
      {message ? (
        <p
          className={
            message.type === "ok"
              ? "rounded-lg bg-green-100 px-4 py-3 text-sm font-bold text-green-800"
              : "rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error"
          }
          role="alert"
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
