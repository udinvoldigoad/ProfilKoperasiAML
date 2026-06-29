import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { isValidNik } from "@/lib/auth-identifiers";
import { createMember } from "@/lib/db/members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";

const schema = z.object({
  // Optional: blank -> server assigns the next sequential number.
  memberNumber: z.string().trim().optional().or(z.literal("")),
  fullName: z.string().trim().min(1, "Nama wajib diisi."),
  nik: z.string().trim().refine(isValidNik, "NIK harus 16 digit angka."),
  birthPlace: z.string().trim().min(1, "Tempat lahir wajib diisi."),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir format YYYY-MM-DD."),
  address: z.string().trim().min(1, "Alamat wajib diisi."),
  email: z.string().trim().email("Email tidak valid.").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  memberType: z.enum(["anggota_lama", "anggota_baru"]),
  status: z.enum(["aktif", "nonaktif", "ditangguhkan"])
});

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang dapat menambah anggota." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { email, phone, ...rest } = parsed.data;
  const result = await createMember({
    ...rest,
    email: email || undefined,
    phone: phone || undefined
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit({
    actorProfileId: session.profileId,
    action: "create",
    entityType: "members",
    entityId: result.id,
    summary: `Menambah anggota ${parsed.data.fullName}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, id: result.id });
}
