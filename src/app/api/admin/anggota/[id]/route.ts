import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { softDeleteMember, updateMember } from "@/lib/db/members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";

const updateSchema = z.object({
  fullName: z.string().trim().min(1, "Nama wajib diisi."),
  birthPlace: z.string().trim().min(1, "Tempat lahir wajib diisi."),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir format YYYY-MM-DD."),
  address: z.string().trim().min(1, "Alamat wajib diisi."),
  email: z.string().trim().email("Email tidak valid.").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  memberType: z.enum(["anggota_lama", "anggota_baru"]),
  status: z.enum(["aktif", "nonaktif", "ditangguhkan"])
});

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { email, phone, ...rest } = parsed.data;
  const result = await updateMember(id, { ...rest, email: email || undefined, phone: phone || undefined });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "update",
    entityType: "members",
    entityId: id,
    summary: `Memperbarui anggota ${parsed.data.fullName}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  const result = await softDeleteMember(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "delete",
    entityType: "members",
    entityId: id,
    summary: "Menonaktifkan anggota",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
