"use client";

import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { useState } from "react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Changing the password may revoke the current session. Navigate to the
      // dashboard; if the session was revoked, middleware sends the member to
      // /login (next=dashboard) and re-login lands them on the dashboard.
      router.push("/anggota/dashboard");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Password Baru
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
        Konfirmasi Password Baru
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
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <KeyRound size={18} aria-hidden="true" />
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}
