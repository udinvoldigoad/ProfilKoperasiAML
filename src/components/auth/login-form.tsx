"use client";

import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RegisterCta } from "@/components/auth/register-cta";

type Mode = "anggota" | "admin";

export function LoginForm({ next, whatsapp }: { next?: string; whatsapp?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("anggota");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, identifier, password, next })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setIdentifier("");
    setPassword("");
    setError(null);
  }

  return (
    <>
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-gray p-1">
        <button
          type="button"
          onClick={() => switchMode("anggota")}
          className={cn(
            "flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-bold transition",
            mode === "anggota" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          )}
        >
          <UserRound size={16} aria-hidden="true" />
          Anggota
        </button>
        <button
          type="button"
          onClick={() => switchMode("admin")}
          className={cn(
            "flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-bold transition",
            mode === "admin" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
          )}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Admin
        </button>
      </div>

      {mode === "anggota" ? (
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="member-nik">
            NIK Anggota
          </label>
          <input
            id="member-nik"
            inputMode="numeric"
            maxLength={16}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value.replace(/\D/g, "").slice(0, 16))}
            className="mt-2 min-h-12 w-full rounded-lg border border-border-subtle px-4"
            placeholder="1807061204860001"
            autoComplete="username"
            required
          />
          <p className="mt-2 text-sm text-muted-text">Masukkan 16 digit NIK yang terdaftar sebagai anggota koperasi.</p>
        </div>
      ) : (
        <div>
          <label className="text-sm font-bold text-primary" htmlFor="admin-email">
            Email Admin
          </label>
          <input
            id="admin-email"
            type="email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-border-subtle px-4"
            placeholder="admin@agrimulyolestari.id"
            autoComplete="username"
            required
          />
        </div>
      )}

      <div>
        <label className="text-sm font-bold text-primary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-lg border border-border-subtle px-4"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} aria-hidden="true" />
        {loading ? "Memproses..." : mode === "anggota" ? "Login Anggota" : "Login Admin"}
      </button>
    </form>
    {mode === "anggota" ? <RegisterCta whatsapp={whatsapp} /> : null}
    </>
  );
}
