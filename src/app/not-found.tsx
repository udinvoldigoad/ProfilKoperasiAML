import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="container-page py-24">
        <div className="max-w-2xl rounded-3xl border border-border-subtle bg-white p-8">
          <p className="text-sm font-bold text-secondary">404</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Halaman tidak ditemukan</h1>
          <p className="mt-3 text-on-surface-variant">
            Tautan yang dibuka belum tersedia atau sudah berubah. Silakan kembali ke beranda.
          </p>
          <div className="mt-6">
            <ButtonLink href="/">Kembali ke Beranda</ButtonLink>
          </div>
          <Link className="sr-only" href="/login">
            Login
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
