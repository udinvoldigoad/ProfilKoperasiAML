import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { isSafeProfilePhotoFilename, profilePhotoContentType, profilePhotoUploadDirectory } from "@/lib/profile-photo-storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!isSafeProfilePhotoFilename(filename)) {
    return NextResponse.json({ error: "Nama file tidak valid." }, { status: 400 });
  }

  try {
    const bytes = await readFile(join(profilePhotoUploadDirectory(), filename));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": profilePhotoContentType(filename),
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }
}
