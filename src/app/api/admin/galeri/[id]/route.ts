import { rm } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { deleteGalleryItem } from "@/lib/db/gallery";
import { galleryFilenameFromUrl, galleryUploadDirectory } from "@/lib/gallery-storage";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }

  const { id } = await params;
  const result = await deleteGalleryItem(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const filename = galleryFilenameFromUrl(result.item.imageUrl);
  if (filename) {
    await rm(join(galleryUploadDirectory(), filename), { force: true }).catch(() => undefined);
  }

  await logAudit({
    actorProfileId: session.profileId,
    action: "delete",
    entityType: "gallery",
    entityId: result.item.id,
    summary: `Menghapus foto galeri ${result.item.title}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
