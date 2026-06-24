import { CalendarDays, ChevronRight, MapPin, ShieldCheck, Users } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { hardcodedGallery, products, siteProfile, stats } from "@/lib/data";

export default function HomePage() {
  return (
    <PublicShell>
      {/* HERO */}
      <section className="relative min-h-[640px] overflow-hidden bg-primary text-white">
        <img
          src={siteProfile.heroImage}
          alt="Lanskap pertanian Desa Giri Mulyo"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="container-page relative z-10 flex min-h-[640px] items-center py-16">
          <div className="max-w-3xl -translate-y-8 md:-translate-y-10">
            <p className="mb-4 text-base font-bold text-[#93cfe6]">{siteProfile.village}, Lampung Timur</p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Koperasi {siteProfile.shortName} untuk Ekonomi Desa yang Maju Bersama
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90">
              Wadah gotong royong warga Desa Giri Mulyo: layanan pertanian, distribusi hasil panen, dan pelayanan
              anggota yang tertib dan terbuka.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#produk" className="rounded-full">
                Lihat Produk &amp; Layanan
              </ButtonLink>
              <ButtonLink href="/pengumuman" variant="secondary" className="rounded-full border-white/70 bg-white/10 text-white hover:bg-white/20">
                Pengumuman
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" className="rounded-full border-white/70 bg-white text-primary">
                Login Anggota
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container-page relative z-20 -mt-32 md:-mt-40">
        <div className="grid overflow-hidden rounded-3xl border border-white/45 bg-white/45 shadow-soft backdrop-blur-2xl md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-border-subtle p-6 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
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
