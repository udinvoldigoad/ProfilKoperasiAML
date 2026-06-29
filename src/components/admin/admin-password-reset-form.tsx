"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useNotify } from "@/components/ui/notification";

export function AdminPasswordResetForm() {
  const notify = useNotify();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password admin minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal reset password admin.");
        return;
      }
      setPassword("");
      setConfirm("");
      notify("Password admin berhasil diganti.");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Password Admin Baru
        <input
          type="password"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Konfirmasi Password
        <input
          type="password"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Ulangi password baru"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          required
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error md:col-span-2" role="alert">
          {error}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound size={18} aria-hidden="true" />
          {loading ? "Menyimpan..." : "Reset Password Admin"}
        </button>
      </div>
    </form>
  );
}
