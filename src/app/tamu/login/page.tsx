import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { GuestLoginForm } from "@/components/tamu/guest-login-form";
import { PublicShell } from "@/components/public/public-shell";
import { Card } from "@/components/ui/card";
import { siteAssetUrl } from "@/lib/site-assets";

export const metadata: Metadata = {
  title: "Login Tamu",
  description: "Login tamu untuk presensi QR Koperasi Agro Mulyo Lestari."
};

export default async function GuestLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <PublicShell>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <img src={siteAssetUrl("images/logo-koperasi.png")} alt="Logo Koperasi" className="mx-auto h-16 w-16 object-contain" />
            <h1 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">Presensi Tamu</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Masukkan dua identitas singkat agar panitia mudah mengenali kehadiran Anda.
            </p>
          </div>

          <Card className="mt-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-surface-gray p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container text-white">
                <UserRound size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-primary">Data tamu berlaku 7 hari</p>
                <p className="text-sm text-on-surface-variant">Setelah itu data tamu otomatis dibersihkan.</p>
              </div>
            </div>
            <GuestLoginForm next={next} />
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
