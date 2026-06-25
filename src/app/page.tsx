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
      <section className="relative isolate min-h-[calc(100svh_-_5rem)] overflow-hidden bg-primary text-white">
        <img
          src={siteProfile.heroImage}
          alt="Lanskap pertanian Desa Giri Mulyo"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Lighter brand tint so more of the photo shows through. */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-teal-dark/40" />
        {/* Decorative glows in palette colors. */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary-container/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#93cfe6]/15 blur-3xl" />

        <div className="container-page relative z-10 flex min-h-[calc(100svh_-_5rem)] flex-col justify-center py-12 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur sm:px-4 sm:py-1.5 sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#93cfe6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#93cfe6]" />
              </span>
              Koperasi Desa {siteProfile.village} · Lampung Timur
            </span>

            <h1 className="mt-4 text-2xl font-extrabold leading-[1.12] sm:mt-6 sm:text-4xl md:text-6xl">
              Ekonomi Pertanian Desa yang <span className="text-secondary-container">Tumbuh</span> dan{" "}
              <span className="text-[#93cfe6]">Maju Bersama</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:mt-6 sm:text-lg">
              Koperasi {siteProfile.name} menyatukan warga Desa Giri Mulyo lewat layanan pertanian, distribusi hasil
              panen, dan pengelolaan anggota yang tertib serta terbuka.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 pt-1 sm:mt-8 sm:flex sm:flex-wrap sm:gap-3 sm:pt-0">
              <Link
                href="#produk"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-bold sm:text-sm text-primary shadow-soft transition hover:bg-white/90 sm:min-h-12 sm:px-6"
              >
                <span className="sm:hidden">Produk</span>
                <span className="hidden sm:inline">Lihat Produk &amp; Layanan</span>
                <ArrowRight size={16} aria-hidden="true" className="hidden shrink-0 sm:inline" />
              </Link>
              <Link
                href="/unit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-secondary-container px-3 text-xs font-bold sm:text-sm text-white shadow-soft transition hover:brightness-105 sm:min-h-12 sm:px-6"
              >
                <MapPin size={16} aria-hidden="true" className="hidden shrink-0 sm:inline" />
                <span className="sm:hidden">Unit</span>
                <span className="hidden sm:inline">Unit Koperasi</span>
              </Link>
              <Link
                href="/pengumuman"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 text-xs font-bold sm:text-sm text-white backdrop-blur transition hover:bg-white/20 sm:min-h-12 sm:px-6"
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
              description="Koperasi Agro Mulyo Lestari berada di Desa Giri Mulyo, Kecamatan Marga Sekampung, Kabupaten Lampung Timur. Kami melayani kebutuhan pertanian anggota, menampung hasil panen, dan mengelola data anggota secara terbuka."
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Tata kelola terbuka", ShieldCheck],
                ["Anggota aktif terdata", Users],
                ["Agenda koperasi tertib", CalendarDays],
                ["Lokasi unit terpetakan", MapPin]
              ].map(([label, Icon]) => (
                <div key={String(label)} className="flex min-h-14 items-center gap-2 rounded-2xl border border-border-subtle bg-surface-gray px-3 sm:gap-3 sm:px-4">
                  <Icon className="shrink-0 text-primary" size={18} aria-hidden="true" />
                  <span className="text-sm font-bold leading-tight text-on-surface sm:text-base">{String(label)}</span>
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
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden p-0">
                <img src={product.imageUrl} alt={product.title} className="h-40 w-full object-cover sm:h-44" />
                <div className="flex flex-1 flex-col p-5">
                  <Badge tone="secondary">{product.category}</Badge>
                  <h3 className="mt-3 text-lg font-bold text-primary">{product.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{product.description}</p>
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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {hardcodedGallery.map((item) => (
              <figure key={item.id} className="group relative overflow-hidden rounded-2xl border border-border-subtle">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur sm:text-xs">
                    {item.category}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold leading-tight text-white sm:text-base">{item.title}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-surface-gray p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-primary">Ingin mengenal unit usaha kami?</h3>
              <p className="mt-1 text-on-surface-variant">Lihat unit-unit koperasi beserta titik lokasinya pada peta.</p>
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
