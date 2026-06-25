import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { getSiteProfile } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Pendaftaran Anggota",
  description: "Informasi pendaftaran anggota Koperasi Agri Mulyo Lestari."
};

export default async function SignupPage() {
  const siteProfile = await getSiteProfile();
  const waLink = `https://wa.me/${siteProfile.whatsapp.replace(/\D/g, "")}`;
  return (
    <PublicShell>
      <section className="container-page flex min-h-[600px] items-center py-16">
        <Card className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold text-secondary">Pendaftaran Anggota</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-primary">Pendaftaran hanya dilakukan oleh admin koperasi</h1>
          <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">
            Untuk menjaga validitas data, akun anggota dibuat oleh admin Koperasi Agri Mulyo Lestari. Silakan hubungi admin melalui kontak resmi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={waLink}>Hubungi Admin WhatsApp</ButtonLink>
          </div>
        </Card>
      </section>
    </PublicShell>
  );
}
