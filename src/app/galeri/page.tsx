import type { Metadata } from "next";
import { Camera, Images } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { listAllGalleryItems } from "@/lib/db/gallery";
import { formatDateID } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Kumpulan foto kegiatan dan potensi Koperasi Agro Mulyo Lestari."
};

export default async function GaleriPage() {
  const items = await listAllGalleryItems();

  return (
    <PublicShell>
      <main className="bg-surface-gray">
        <section className="container-page py-14 sm:py-20">
          <BackButton className="mb-4" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Galeri"
              title="Kumpulan foto kegiatan koperasi"
              description="Dokumentasi kegiatan awal sampai foto terbaru Koperasi Agro Mulyo Lestari."
            />
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-bold text-primary">
              <Images size={18} aria-hidden="true" />
              {items.length} foto
            </div>
          </div>

          {items.length ? (
            <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={`${item.id}-${item.imageUrl}`} className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-soft">
                  <img src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="secondary">{item.category}</Badge>
                      <span className="text-xs font-bold text-muted-text">{formatDateID(item.eventDate)}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-primary">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.description}</p>
                  </div>
                </article>
              ))}
            </Reveal>
          ) : (
            <div className="mt-10">
              <EmptyState icon={Camera} title="Belum ada foto" description="Foto galeri akan muncul setelah admin mengupload dokumentasi." />
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
