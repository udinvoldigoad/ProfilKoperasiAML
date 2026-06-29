import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { createGalleryItem } from "@/lib/db/gallery";
import { GALLERY_ALLOWED_TYPES, GALLERY_MAX_FILE_SIZE, galleryPublicUrl, galleryUploadDirectory } from "@/lib/gallery-storage";
import { processUploadImageToWebp } from "@/lib/image-upload-processing";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 }) };
  }
  return { session };
}

function safeText(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function slugPart(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "galeri";
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan upload tidak valid." }, { status: 400 });
  }

  const title = safeText(formData.get("title"));
  const category = safeText(formData.get("category"), "Galeri");
  const description = safeText(formData.get("description"));
  const eventDate = safeText(formData.get("eventDate"));
  const file = formData.get("file");

  if (!title) return NextResponse.json({ error: "Judul foto wajib diisi." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "File gambar wajib dipilih." }, { status: 400 });
  if (!GALLERY_ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Format gambar harus JPG, PNG, atau WEBP." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > GALLERY_MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 8 MB." }, { status: 400 });
  }

  let processedImage: Awaited<ReturnType<typeof processUploadImageToWebp>>;
  try {
    processedImage = await processUploadImageToWebp(file, { maxWidth: 1920, maxHeight: 1920, quality: 78 });
  } catch {
    return NextResponse.json({ error: "Gambar gagal dikompres. Pastikan file gambar tidak rusak." }, { status: 400 });
  }

  const filename = `${Date.now()}-${slugPart(title)}-${randomUUID().slice(0, 8)}.${processedImage.extension}`;
  const directory = galleryUploadDirectory();
  const filePath = join(directory, filename);
  const imageUrl = galleryPublicUrl(filename);

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, processedImage.buffer);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan file ke storage hosting." }, { status: 500 });
  }

  const result = await createGalleryItem({ title, category, description, eventDate, imageUrl });
  if (!result.ok) {
    await rm(filePath, { force: true }).catch(() => undefined);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "create",
    entityType: "gallery",
    entityId: result.item.id,
    summary: `Upload foto galeri ${title}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, item: result.item });
}
