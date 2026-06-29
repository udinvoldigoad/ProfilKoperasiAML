import { galleryItems as initialGalleryItems } from "@/lib/data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { GalleryItem } from "@/types";

export type CreateGalleryInput = {
  title: string;
  imageUrl: string;
  description?: string | null;
  eventDate?: string | null;
  category?: string | null;
};

export type MutationResult = { ok: true; item: GalleryItem } | { ok: false; error: string };
export type DeleteGalleryResult = { ok: true; item: GalleryItem } | { ok: false; error: string };

function dateOnly(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

function dateInput(value?: string | null): Date | null {
  if (!value) return null;
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

function mapRow(row: {
  id: string;
  title: string;
  imageUrl: string;
  description: string | null;
  eventDate: Date | null;
  category: string | null;
  createdAt: Date;
}): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    description: row.description ?? "Dokumentasi kegiatan Koperasi Agro Mulyo Lestari.",
    eventDate: dateOnly(row.eventDate ?? row.createdAt),
    category: row.category ?? "Galeri"
  };
}

function uniqueByImageUrl(items: GalleryItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.imageUrl)) return false;
    seen.add(item.imageUrl);
    return true;
  });
}

export async function listUploadedGalleryItems(): Promise<GalleryItem[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.gallery.findMany({
      orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }]
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function listAllGalleryItems(): Promise<GalleryItem[]> {
  const uploaded = await listUploadedGalleryItems();
  return uniqueByImageUrl([...uploaded, ...initialGalleryItems]);
}

export async function listHomepageGalleryItems(limit = 6): Promise<GalleryItem[]> {
  const items = await listAllGalleryItems();
  return items.slice(0, limit);
}

export async function createGalleryItem(input: CreateGalleryInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    const row = await prisma.gallery.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        description: input.description?.trim() || null,
        eventDate: dateInput(input.eventDate),
        category: input.category?.trim() || "Galeri"
      }
    });
    return { ok: true, item: mapRow(row) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menyimpan galeri." };
  }
}

export async function deleteGalleryItem(id: string): Promise<DeleteGalleryResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  try {
    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Foto galeri tidak ditemukan atau merupakan foto awal." };

    const row = await prisma.gallery.delete({ where: { id } });
    return { ok: true, item: mapRow(row) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menghapus galeri." };
  }
}
