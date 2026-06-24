import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createBoardMember } from "@/lib/db/board-members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";

export const boardMemberSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  position: z.string().trim().min(1, "Jabatan wajib diisi."),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  contact: z.string().trim().optional().or(z.literal("")),
  period: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int("Urutan harus bilangan bulat.").min(0, "Urutan tidak boleh negatif.")
});

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 }) };
  }
  if (session.demo) {
    return { error: NextResponse.json({ error: "Mode demo tidak menyimpan data." }, { status: 503 }) };
  }
  return { session };
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const parsed = boardMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const result = await createBoardMember(parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "create",
    entityType: "board_members",
    entityId: result.id,
    summary: `Menambah pengurus ${parsed.data.name} (${parsed.data.position})`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, id: result.id });
}
