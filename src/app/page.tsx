import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, MapPin, ShieldCheck, Users } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { hardcodedGallery, products } from "@/lib/data";
import { getSiteProfile } from "@/lib/db/settings";

export default async function HomePage() {
  const siteProfile = await getSiteProfile();
  return (
    <PublicShell>
      {/* HERO */}
      <section className="relative isolate min-h-[660px] overflow-hidden bg-primary text-white">
        <img
          src={siteProfile.heroImage}
          alt="Lanskap pertanian Desa Giri Mulyo"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Palette-based brand tint over the photo. */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-teal-dark/60" />
        {/* Decorative glows in palette colors. */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary-container/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-72 w-72 rounded-full bg-[#93cfe6]/20 blur-3xl" />

        <div className="container-page relative z-10 flex min-h-[660px] flex-col justify-center py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-bold backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#93cfe6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#93cfe6]" />
              </span>
              Koperasi Desa {siteProfile.village} · Lampung Timur
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] md:text-6xl">
              Ekonomi Pertanian Desa yang <span className="text-secondary-container">Tumbuh</span> dan{" "}
              <span className="text-[#93cfe6]">Maju Bersama</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/85">
              Koperasi {siteProfile.name} menyatukan warga Desa Giri Mulyo lewat layanan pertanian, distribusi hasil
              panen, dan pengelolaan anggota yang tertib serta terbuka.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#produk"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary shadow-soft transition hover:bg-white/90"
              >
                Lihat Produk &amp; Layanan
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/unit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-secondary-container px-6 text-sm font-bold text-white shadow-soft transition hover:brightness-105"
              >
                <MapPin size={18} aria-hidden="true" />
                Unit Koperasi
              </Link>
              <Link
                href="/pengumuman"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Pengumuman
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle">
            <img src={siteProfile.meetingImage} alt="Rapat pengurus koperasi" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div>
            <SectionHeading
              eyebrow="Tentang Kami"
              title="Gotong royong ekonomi warga yang dikelola lebih tertib"
              description="Koperasi Agri Mulyo Lestari berada di Desa Giri Mulyo, Kecamatan Marga Sekampung, Kabupaten Lampung Timur. Kami melayani kebutuhan pertanian anggota, menampung hasil panen, dan mengelola data anggota secara terbuka."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Tata kelola terbuka", ShieldCheck],
                ["Anggota aktif terdata", Users],
                ["Agenda koperasi tertib", CalendarDays],
                ["Lokasi unit terpetakan", MapPin]
              ].map(([label, Icon]) => (
                <div key={String(label)} className="flex min-h-14 items-center gap-3 rounded-2xl border border-border-subtle bg-surface-gray px-4">
                  <Icon className="text-primary" size={20} aria-hidden="true" />
                  <span className="font-bold text-on-surface">{String(label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-page mt-12 grid gap-6 md:grid-cols-3">
          <Card>
            <h3 className="text-xl font-bold text-primary">Visi</h3>
            <p className="mt-3 text-on-surface-variant">
              Menjadi koperasi desa yang terpercaya dan mampu memperkuat ekonomi pertanian masyarakat.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-primary">Misi</h3>
            <p className="mt-3 text-on-surface-variant">
              Menertibkan data anggota, memperluas layanan koperasi, dan mendampingi usaha tani warga.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-bold text-primary">Nilai</h3>
            <p className="mt-3 text-on-surface-variant">
              Gotong royong, keterbukaan, keberlanjutan, dan pelayanan yang ramah bagi semua anggota.
            </p>
          </Card>
        </div>
      </section>

      {/* PRODUK */}
      <section id="produk" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Produk dan Layanan"
            title="Layanan koperasi yang dekat dengan kebutuhan warga"
            description="Mulai dari simpan pinjam, penyediaan sarana pertanian, hingga distribusi hasil panen anggota."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden p-0">
                <img src={product.imageUrl} alt={product.title} className="h-48 w-full object-cover" />
                <div className="p-6">
                  <Badge tone="secondary">{product.category}</Badge>
                  <h3 className="mt-4 text-xl font-bold text-primary">{product.title}</h3>
                  <p className="mt-3 text-sm text-on-surface-variant">{product.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GALERI */}
      <section id="galeri" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Galeri"
            title="Dokumentasi kegiatan dan potensi desa"
            description="Sekilas potret kegiatan koperasi dan potensi pertanian Desa Giri Mulyo."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {hardcodedGallery.map((item) => (
              <Card key={item.id} className="overflow-hidden p-0">
                <img src={item.imageUrl} alt={item.title} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <Badge tone="tertiary">{item.category}</Badge>
                  <h3 className="mt-3 font-bold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-surface-gray p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-primary">Ingin mengenal unit usaha kami?</h3>
              <p className="mt-1 text-on-surface-variant">Lihat keempat unit koperasi beserta lokasinya pada peta.</p>
            </div>
            <ButtonLink href="/unit">
              Lihat Unit Koperasi
              <ChevronRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
