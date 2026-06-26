import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
          <Compass size={32} aria-hidden="true" />
        </span>
        <p className="mt-6 text-6xl font-extrabold text-primary-container sm:text-7xl">404</p>
        <h1 className="mt-3 text-2xl font-extrabold text-primary sm:text-3xl">Halaman tidak ditemukan</h1>
        <p className="mt-3 max-w-md text-on-surface-variant">
          Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-container px-6 text-sm font-bold text-white shadow-soft transition hover:bg-teal-dark"
        >
          <Home size={18} aria-hidden="true" />
          Kembali ke Beranda
        </Link>
      </section>
    </PublicShell>
  );
}
