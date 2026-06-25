import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteUploadedImage } from "@/lib/db/storage";

const ALLOWED_BUCKETS = new Set(["board-photos", "unit-photos", "member-photos"]);
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan file." }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const bucket = String(form?.get("bucket") ?? "");

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Bucket tidak valid." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WEBP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran file maksimal 2 MB." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." }, { status: 503 });
  }

  const path = `${globalThis.crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await admin.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}

/** Removes a not-yet-saved upload so throwaway files don't accumulate. */
export async function DELETE(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan file." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  await deleteUploadedImage(body?.url);
  return NextResponse.json({ ok: true });
}
