import type { Metadata } from "next";
import Link from "next/link";
import { siteAssetUrl } from "@/lib/site-assets";
import { AlertTriangle } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterCta } from "@/components/auth/register-cta";
import { getSiteProfile } from "@/lib/db/settings";
import { isDatabaseConfigured } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Login",
  description: "Login admin dan anggota Koperasi Agro Mulyo Lestari. Anggota masuk memakai NIK."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = isDatabaseConfigured();
  const { whatsapp } = await getSiteProfile();

  return (
    <PublicShell>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img src={siteAssetUrl("images/logo-koperasi.png")} alt="Logo Koperasi" className="mx-auto h-16 w-16 object-contain" />
            <h1 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">Masuk Portal Koperasi</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Anggota masuk dengan <strong>NIK</strong>, admin dengan <strong>email</strong>.
            </p>
          </div>

          <Card className="mt-6 shadow-soft">
            {configured ? (
              <LoginForm next={next} whatsapp={whatsapp} />
            ) : (
              <div className="grid gap-4 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
                  <AlertTriangle size={28} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-primary">Login belum aktif</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Database MySQL Hostinger belum dikonfigurasi. Isi DATABASE_URL produksi terlebih dahulu.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {configured ? (
            <Link
              href={`/tamu/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="mt-4 flex min-h-11 items-center justify-center rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary"
            >
              Presensi sebagai tamu
            </Link>
          ) : null}

          {!configured ? <RegisterCta whatsapp={whatsapp} /> : null}
        </div>
      </section>
    </PublicShell>
  );
}
