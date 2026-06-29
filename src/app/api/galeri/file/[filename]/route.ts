import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { galleryContentType, galleryUploadDirectory, isSafeGalleryFilename } from "@/lib/gallery-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isSafeGalleryFilename(filename)) {
    return NextResponse.json({ error: "Nama file tidak valid." }, { status: 400 });
  }

  try {
    const bytes = await readFile(join(galleryUploadDirectory(), filename));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": galleryContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }
}
