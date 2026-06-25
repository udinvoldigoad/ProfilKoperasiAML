"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Loader2, QrCode, UserRound } from "lucide-react";
import { formatDateTimeWIB, parseQrToken } from "@/lib/utils";

type ScanState = "idle" | "scanning" | "submitting" | "success" | "error";

type ScanResult = {
  eventTitle: string;
  memberName: string;
  attendedAt: string;
  method: string;
};

type ValidationPayload = {
  ok: boolean;
  message: string;
  result?: ScanResult;
};

type ScannerInstance = {
  start: (
    cameraConfig: { facingMode: string },
    config: { fps: number; aspectRatio?: number },
    onSuccess: (decodedText: string) => void | Promise<void>,
    onError: () => void
  ) => Promise<unknown>;
  stop: () => Promise<unknown>;
  clear: () => void;
};

function DetailRow({ icon: Icon, label, value }: { icon: typeof CalendarCheck2; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border-subtle bg-white px-4 py-3 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
        <Icon size={19} aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase text-muted-text">{label}</p>
        <p className="mt-1 font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}

export function QrScanner({ initialToken }: { initialToken?: string }) {
  const [state, setState] = useState<ScanState>("idle");
  const [message, setMessage] = useState("Menyiapkan kamera...");
  const [result, setResult] = useState<ScanResult | null>(null);
  const scannerRef = useRef<ScannerInstance | null>(null);
  const isRunningRef = useRef(false);
  const isStoppingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner || isStoppingRef.current) return;

    isStoppingRef.current = true;
    try {
      if (isRunningRef.current) {
        await scanner.stop();
        isRunningRef.current = false;
      }
    } catch {
      isRunningRef.current = false;
    }

    try {
      scanner.clear();
    } catch {
      // Scanner may already be detached during fast route changes.
    } finally {
      scannerRef.current = null;
      isStoppingRef.current = false;
    }
  }

  async function submitToken(raw: string) {
    if (hasSubmittedRef.current) return;

    const token = parseQrToken(raw);
    if (!token) {
      setState("error");
      setMessage("QR Code tidak berisi token presensi yang valid.");
      return;
    }

    hasSubmittedRef.current = true;
    setResult(null);
    setState("submitting");
    setMessage("Memvalidasi presensi...");
    await stopScanner();

    const response = await fetch("/api/presensi/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const payload = (await response.json()) as ValidationPayload;
    setState(payload.ok ? "success" : "error");
    setMessage(payload.message);
    setResult(payload.ok && payload.result ? payload.result : null);
  }

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        // Camera (getUserMedia) only works in a secure context: https or
        // localhost/127.0.0.1. Over http on a LAN IP (e.g. from a phone) the
        // browser blocks it silently — no permission prompt ever appears.
        if (typeof window !== "undefined" && !window.isSecureContext) {
          setState("error");
          setMessage(
            "Kamera hanya bisa diakses lewat HTTPS atau localhost. Saat ini situs dibuka tanpa HTTPS, jadi browser memblokir kamera. Buka lewat alamat HTTPS untuk presensi."
          );
          return;
        }
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
          setState("error");
          setMessage("Perangkat atau browser ini tidak mendukung akses kamera. Coba browser lain (mis. Chrome).");
          return;
        }

        const { Html5Qrcode } = await import("html5-qrcode");
        if (!mounted || scannerRef.current || hasSubmittedRef.current) return;

        const scanner = new Html5Qrcode("qr-reader") as unknown as ScannerInstance;
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, aspectRatio: 1 },
          async (decodedText) => {
            await submitToken(decodedText);
          },
          () => undefined
        );

        isRunningRef.current = true;

        if (!mounted) {
          try {
            await scanner.stop();
          } catch {
            // Route changed before the scanner fully settled.
          }
          try {
            scanner.clear();
          } catch {
            // The scanner container may already be gone.
          }
          isRunningRef.current = false;
          scannerRef.current = null;
          return;
        }

        setState("scanning");
        setMessage("Arahkan kamera ke QR Code acara.");
      } catch {
        if (!mounted) return;
        setState("error");
        setMessage("Kamera belum aktif. Izinkan akses kamera di browser, lalu muat ulang halaman ini.");
      }
    }

    start();

    return () => {
      mounted = false;
      void stopScanner();
    };
  }, []);

  useEffect(() => {
    if (initialToken) {
      void submitToken(initialToken);
    }
  }, [initialToken]);

  if (state === "success") {
    return (
      <section className="overflow-hidden rounded-3xl border border-green-200 bg-white">
        <div className="bg-gradient-to-b from-green-50 to-white px-6 pb-6 pt-8 text-center sm:px-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-600 text-white shadow-[0_16px_40px_rgba(22,163,74,0.25)]">
            <CheckCircle2 size={42} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm font-bold uppercase text-green-700">Scan QR berhasil</p>
          <h1 className="mt-2 text-3xl font-extrabold text-primary">Presensi Tercatat</h1>
          <p className="mx-auto mt-3 max-w-md text-on-surface-variant">{message}</p>
        </div>

        <div className="grid gap-3 px-5 pb-6 sm:px-8">
          <DetailRow icon={UserRound} label="Nama Anggota" value={result?.memberName ?? "Anggota"} />
          <DetailRow icon={CalendarCheck2} label="Acara" value={result?.eventTitle ?? "Acara koperasi"} />
          <DetailRow icon={Clock3} label="Waktu Presensi" value={result?.attendedAt ? formatDateTimeWIB(result.attendedAt) : "Baru saja"} />
          <DetailRow icon={QrCode} label="Metode" value={result?.method ?? "QR Code"} />
        </div>

        <div className="grid gap-3 border-t border-border-subtle bg-surface-container-low p-5 sm:grid-cols-2 sm:p-6">
          <Link
            href="/anggota/riwayat-kehadiran"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white"
          >
            Lihat Riwayat
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/anggota/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border-subtle bg-white p-5 sm:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">Pindai QR Code</h1>
        <p className="mx-auto mt-2 max-w-md text-on-surface-variant">
          Arahkan kamera perangkat ke QR presensi yang ditampilkan panitia.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-[420px]">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#101820]">
          <div
            id="qr-reader"
            className="h-full w-full overflow-hidden rounded-2xl [&_img]:hidden [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover"
          />
          <div className="pointer-events-none absolute inset-7 sm:inset-10">
            <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-lg border-l-4 border-t-4 border-[#93cfe6]" />
            <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-lg border-r-4 border-t-4 border-[#93cfe6]" />
            <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-lg border-b-4 border-l-4 border-[#93cfe6]" />
            <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-lg border-b-4 border-r-4 border-[#93cfe6]" />
          </div>
          {state === "scanning" ? <div className="animate-scan-laser absolute left-10 right-10 h-0.5 bg-[#93cfe6]" /> : null}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(0,0,0,0.45)]" />
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-subtle bg-surface-container-low px-4 text-sm font-bold text-primary">
          {state === "error" ? <AlertCircle size={18} aria-hidden="true" /> : null}
          {state === "submitting" || state === "idle" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
          {state === "scanning" ? <QrCode size={18} aria-hidden="true" /> : null}
          {message}
        </div>
      </div>
    </section>
  );
}
