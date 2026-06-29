"use client";

import Link from "next/link";
import { LogIn, Building2, UserRound } from "lucide-react";
import { useState } from "react";

export function GuestLoginForm({ next }: { next?: string }) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/tamu/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, origin, next })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal masuk sebagai tamu.");
        return;
      }
      window.location.replace(data.redirectTo ?? "/presensi/scan");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-primary">
          Nama Lengkap
          <span className="relative block">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={18} aria-hidden="true" />
            <input
              className="min-h-12 w-full rounded-lg border border-border-subtle px-10 font-normal text-on-surface"
              placeholder="Nama tamu"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-bold text-primary">
          Asal / Instansi
          <span className="relative block">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={18} aria-hidden="true" />
            <input
              className="min-h-12 w-full rounded-lg border border-border-subtle px-10 font-normal text-on-surface"
              placeholder="Desa / instansi / rombongan"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              autoComplete="organization"
              required
            />
          </span>
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
          <LogIn size={18} aria-hidden="true" />
          {loading ? "Memproses..." : "Masuk sebagai Tamu"}
        </button>
      </form>

      <Link
        href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary"
      >
        Saya anggota koperasi
      </Link>
    </div>
  );
}
