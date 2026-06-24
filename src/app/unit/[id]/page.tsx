import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, ExternalLink, Info, MapPin, Phone } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { units } from "@/lib/data";

function getUnit(id: string) {
  return units.find((unit) => unit.id === id);
}

function gmapsUrl(unit: NonNullable<ReturnType<typeof getUnit>>) {
  return unit.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${unit.latitude},${unit.longitude}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const unit = getUnit(id);
  return { title: unit ? unit.name : "Unit Koperasi" };
}

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const unit = getUnit(id);
  if (!unit) notFound();

  return (
    <PublicShell>
      <section className="container-page py-10 sm:py-14">
        <Link href="/unit" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">
          <ArrowLeft size={18} aria-hidden="true" />
          Kembali ke Daftar Unit
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            {unit.photoUrl ? (
              <img src={unit.photoUrl} alt={unit.name} className="aspect-[4/3] w-full rounded-3xl border border-border-subtle object-cover" />
            ) : null}
            <Badge tone="secondary" className="mt-6">
              {unit.type}
            </Badge>
            <h1 className="mt-3 text-3xl font-extrabold text-primary sm:text-4xl">{unit.name}</h1>
            <p className="mt-3 flex items-start gap-2 text-on-surface-variant">
              <MapPin size={18} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
              {unit.address}
            </p>
            {unit.contact ? (
              <p className="mt-2 flex items-center gap-2 font-bold text-primary">
                <Phone size={18} aria-hidden="true" />
                {unit.contact}
              </p>
            ) : null}

            <a
              href={gmapsUrl(unit)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white transition hover:bg-teal-dark"
            >
              <ExternalLink size={18} aria-hidden="true" />
              Lihat di Google Maps
            </a>
          </div>

          <div className="grid gap-4">
            <Card>
              <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
                <Info size={18} className="text-secondary" aria-hidden="true" />
                Tentang Unit
              </h2>
              <p className="mt-3 text-on-surface-variant">{unit.description}</p>
              <p className="mt-3 rounded-lg bg-surface-container-low px-4 py-3 text-sm text-muted-text">
                Informasi detail unit ini akan dilengkapi kemudian (sejarah, kegiatan, dan layanan lengkap).
              </p>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-primary">Layanan Unit</h2>
              <p className="mt-2 text-sm text-muted-text">Daftar layanan akan ditambahkan setelah didiskusikan.</p>
              <ul className="mt-3 grid gap-2 text-on-surface-variant">
                {["Layanan 1 (placeholder)", "Layanan 2 (placeholder)", "Layanan 3 (placeholder)"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary-container" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
                <Clock3 size={18} className="text-secondary" aria-hidden="true" />
                Jam Operasional
              </h2>
              <p className="mt-2 text-on-surface-variant">Menyusul (placeholder).</p>
            </Card>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
