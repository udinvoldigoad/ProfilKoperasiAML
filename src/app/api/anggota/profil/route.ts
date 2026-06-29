import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { updateMemberProfile } from "@/lib/db/members";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Nama wajib diisi."),
  birthPlace: z.string().trim().min(1, "Tempat lahir wajib diisi."),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir format YYYY-MM-DD."),
  address: z.string().trim().min(1, "Alamat wajib diisi."),
  phone: z.string().trim().optional().or(z.literal(""))
});

export async function PATCH(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "anggota" || !session.member) {
    return NextResponse.json({ error: "Hanya anggota yang dapat mengubah profil ini." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { phone, ...rest } = parsed.data;
  // The member id comes from the verified session, never from the request body,
  // so a member can only ever edit their own row.
  const result = await updateMemberProfile(session.member.id, { ...rest, phone: phone || undefined });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
