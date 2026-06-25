import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createUnit } from "@/lib/db/units";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { unitSchema } from "./schema";

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

  const parsed = unitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const result = await createUnit(parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: "create",
    entityType: "units",
    entityId: result.id,
    summary: `Menambah unit ${parsed.data.name}`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, id: result.id });
}
