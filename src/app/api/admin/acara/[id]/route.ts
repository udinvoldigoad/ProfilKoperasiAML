import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { softDeleteEvent, updateEvent } from "@/lib/db/events";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { eventSchema } from "../schema";

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

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { description, ...rest } = parsed.data;
  const result = await updateEvent(id, { ...rest, description: description || undefined });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "update",
    entityType: "events",
    entityId: id,
    summary: `Memperbarui acara ${parsed.data.title}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  const result = await softDeleteEvent(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "delete",
    entityType: "events",
    entityId: id,
    summary: "Menghapus acara",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
