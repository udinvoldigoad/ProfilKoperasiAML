import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Kontak Koperasi Agri Mulyo Lestari."
};

export default function KontakPage() {
  const waLink = `https://wa.me/${siteProfile.whatsapp.replace(/\D/g, "")}`;

  return (
    <PublicShell>
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Kontak"
          title="Hubungi pengurus koperasi"
          description="Pendaftaran anggota tidak dilakukan mandiri. Masyarakat dapat menghubungi admin melalui WhatsApp atau datang ke kantor koperasi."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="grid gap-5">
              <p className="flex gap-3">
                <MapPin className="mt-1 text-primary" size={22} aria-hidden="true" />
                <span>{siteProfile.address}</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone className="text-primary" size={22} aria-hidden="true" />
                <span>{siteProfile.whatsapp}</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="text-primary" size={22} aria-hidden="true" />
                <span>{siteProfile.email}</span>
              </p>
              <p className="rounded-2xl bg-surface-gray p-4 text-sm font-bold text-primary">{siteProfile.operationalHours}</p>
              <ButtonLink href={waLink}>Chat WhatsApp Admin</ButtonLink>
            </div>
          </Card>
          <Card>
            <form className="grid gap-4">
              <div>
                <label className="text-sm font-bold text-primary" htmlFor="nama">
                  Nama
                </label>
                <input id="nama" className="mt-2 min-h-12 w-full rounded-lg border border-border-subtle px-4" placeholder="Nama lengkap" />
              </div>
              <div>
                <label className="text-sm font-bold text-primary" htmlFor="pesan">
                  Pesan
                </label>
                <textarea id="pesan" className="mt-2 min-h-32 w-full rounded-lg border border-border-subtle px-4 py-3" placeholder="Tulis pesan singkat" />
              </div>
              <button type="button" className="min-h-12 rounded-lg bg-primary-container px-5 text-sm font-bold text-white">
                Simpan Draft Pesan
              </button>
              <p className="text-sm text-muted-text">Form ini disiapkan sebagai UI awal. Pengiriman dapat disambungkan ke Supabase atau email service saat deploy.</p>
            </form>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
