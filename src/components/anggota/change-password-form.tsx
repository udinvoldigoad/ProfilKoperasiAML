"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { useState } from "react";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/anggota/ganti-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengganti password.");
        return;
      }
      setPassword("");
      setConfirm("");
      setSuccess(true);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function closeSuccessModal() {
    window.location.assign("/anggota/dashboard");
  }

  return (
    <>
      <form className="grid gap-5" onSubmit={handleSubmit} autoComplete="off">
        <label className="grid gap-2 text-sm font-bold text-primary">
          Password Baru
          <input
            name="new-password"
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
          Konfirmasi Password Baru
          <input
            name="confirm-new-password"
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
          <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || success}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound size={18} aria-hidden="true" />
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
        </button>
      </form>

      {success ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle2 size={36} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-primary">Password Berhasil Diganti</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Password baru sudah tersimpan. Klik tutup untuk masuk ke dashboard anggota.
            </p>
            <button
              type="button"
              onClick={closeSuccessModal}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary-container px-5 text-sm font-bold text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
