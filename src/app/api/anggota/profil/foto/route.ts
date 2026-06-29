import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { updateBoardMemberPhotoByName } from "@/lib/db/board-members";
import { getMemberForSession, updateMemberPhoto } from "@/lib/db/members";
import { processUploadImageToWebp } from "@/lib/image-upload-processing";
import {
  PROFILE_PHOTO_ALLOWED_TYPES,
  PROFILE_PHOTO_MAX_FILE_SIZE,
  profilePhotoFilenameFromUrl,
  profilePhotoPublicUrl,
  profilePhotoUploadDirectory
} from "@/lib/profile-photo-storage";

export const runtime = "nodejs";

function memberSlug(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "anggota";
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "anggota" || !session.member) {
    return NextResponse.json({ error: "Hanya anggota yang dapat mengganti foto profil." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan upload tidak valid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File foto wajib dipilih." }, { status: 400 });
  if (!PROFILE_PHOTO_ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Format foto harus JPG, PNG, atau WEBP." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > PROFILE_PHOTO_MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran foto maksimal 4 MB." }, { status: 400 });
  }

  const member = await getMemberForSession(session.member.id);
  if (!member) return NextResponse.json({ error: "Data anggota tidak ditemukan." }, { status: 404 });

  let processedImage: Awaited<ReturnType<typeof processUploadImageToWebp>>;
  try {
    processedImage = await processUploadImageToWebp(file, { maxWidth: 960, maxHeight: 960, quality: 80 });
  } catch {
    return NextResponse.json({ error: "Foto gagal dikompres. Pastikan file gambar tidak rusak." }, { status: 400 });
  }

  const filename = `${memberSlug(session.member.id)}-${Date.now()}-${randomUUID().slice(0, 8)}.${processedImage.extension}`;
  const directory = profilePhotoUploadDirectory();
  const filePath = join(directory, filename);
  const photoUrl = profilePhotoPublicUrl(filename);
  const previousFilename = profilePhotoFilenameFromUrl(member.photoUrl);

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, processedImage.buffer);
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan foto ke storage hosting." }, { status: 500 });
  }

  const result = await updateMemberPhoto(session.member.id, photoUrl);
  if (!result.ok) {
    await rm(filePath, { force: true }).catch(() => undefined);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (previousFilename && previousFilename !== filename) {
    await rm(join(directory, previousFilename), { force: true }).catch(() => undefined);
  }

  const boardPhotoUpdated = await updateBoardMemberPhotoByName(member.fullName, photoUrl);
  if (boardPhotoUpdated) {
    revalidatePath("/");
    revalidatePath("/struktur");
  }

  await logAudit({
    actorProfileId: session.profileId,
    action: "update",
    entityType: "members",
    entityId: session.member.id,
    summary: boardPhotoUpdated ? "Mengganti foto profil anggota dan struktur pengurus" : "Mengganti foto profil anggota",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, photoUrl, boardPhotoUpdated });
}
