"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LogIn, MessageCircle, Phone, ShieldCheck, UserRound, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { RegisterCta } from "@/components/auth/register-cta";
import { cn } from "@/lib/utils";

type Mode = "anggota" | "admin" | "tamu";

const MAX_ATTEMPTS = 5;

export function LoginForm({ next, whatsapp }: { next?: string; whatsapp?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("anggota");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [showLockModal, setShowLockModal] = useState(false);

  const waLink = `https://wa.me/${(whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(
    "Halo Admin Koperasi Agro Mulyo Lestari, saya tidak bisa masuk dan ingin meminta reset password akun saya."
  )}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isGuest = mode === "tamu";
      const response = await fetch(isGuest ? "/api/tamu/login" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isGuest
            ? {
                name: guestName,
                phone: guestPhone,
                next: next?.startsWith("/presensi/scan") ? next : "/presensi/scan"
              }
            : { mode, identifier, password, next }
        )
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        if (!isGuest) {
          setFailCount((count) => {
            const nextCount = count + 1;
            if (nextCount >= MAX_ATTEMPTS) setShowLockModal(true);
            return nextCount;
          });
        }
        return;
      }
      setFailCount(0);
      if (isGuest) {
        window.location.replace(data.redirectTo ?? "/presensi/scan");
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
    setGuestName("");
    setGuestPhone("");
    setError(null);
  }

  return (
    <>
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-gray p-1 sm:gap-2">
          <button
            type="button"
            onClick={() => switchMode("anggota")}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1 rounded-md text-xs font-bold transition sm:gap-2 sm:text-sm",
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
              "flex min-h-10 items-center justify-center gap-1 rounded-md text-xs font-bold transition sm:gap-2 sm:text-sm",
              mode === "admin" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
            )}
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => switchMode("tamu")}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1 rounded-md text-xs font-bold transition sm:gap-2 sm:text-sm",
              mode === "tamu" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
            )}
          >
            <UserPlus size={16} aria-hidden="true" />
            Tamu
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
              placeholder="16 digit NIK"
              autoComplete="username"
              required
            />
            <p className="mt-2 text-sm text-muted-text">Masukkan 16 digit NIK yang terdaftar sebagai anggota koperasi.</p>
          </div>
        ) : mode === "admin" ? (
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
              placeholder="email admin"
              autoComplete="username"
              required
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold text-primary" htmlFor="guest-name">
                Nama Lengkap
              </label>
              <div className="relative mt-2">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={18} aria-hidden="true" />
                <input
                  id="guest-name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border-subtle px-10"
                  placeholder="Nama tamu"
                  autoComplete="name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-primary" htmlFor="guest-phone">
                Nomor HP
              </label>
              <div className="relative mt-2">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={18} aria-hidden="true" />
                <input
                  id="guest-phone"
                  inputMode="tel"
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value.replace(/[^0-9+\-\s]/g, ""))}
                  className="min-h-12 w-full rounded-lg border border-border-subtle px-10"
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-muted-text">Data tamu berlaku 7 hari untuk mencegah data presensi menumpuk.</p>
            </div>
          </div>
        )}

        {mode !== "tamu" ? (
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
        ) : null}

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
          {loading ? "Memproses..." : mode === "anggota" ? "Login Anggota" : mode === "admin" ? "Login Admin" : "Masuk Tamu"}
        </button>
      </form>
      {mode === "anggota" ? <RegisterCta whatsapp={whatsapp} /> : null}

      {showLockModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
                <AlertTriangle size={24} aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-text hover:bg-surface-gray"
                aria-label="Tutup"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-bold text-primary">Gagal masuk {failCount} kali</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Jika lupa password, hubungi admin koperasi untuk melakukan reset password akun Anda.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white transition hover:brightness-105"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Hubungi Admin via WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setShowLockModal(false)}
              className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-border-subtle text-sm font-bold text-on-surface-variant hover:bg-surface-gray"
            >
              Coba lagi
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
