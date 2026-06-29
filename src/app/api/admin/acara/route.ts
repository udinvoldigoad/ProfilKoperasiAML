import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createEvent } from "@/lib/db/events";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { eventSchema } from "./schema";

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return { error: NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 }) };
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

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { description, ...rest } = parsed.data;
  const result = await createEvent({ ...rest, description: description || undefined }, guard.session.profileId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "create",
    entityType: "events",
    entityId: result.id,
    summary: `Membuat acara ${parsed.data.title}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, id: result.id });
}
