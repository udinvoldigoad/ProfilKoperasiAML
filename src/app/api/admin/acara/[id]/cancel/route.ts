import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { setEventCancelled } from "@/lib/db/events";
import { clientIp, logAudit } from "@/lib/db/audit-logs";

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const cancelled = Boolean((body as { cancelled?: boolean })?.cancelled);
  const result = await setEventCancelled(id, cancelled);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: guard.session.profileId,
    action: cancelled ? "cancel" : "reinstate",
    entityType: "events",
    entityId: id,
    summary: cancelled ? "Membatalkan acara" : "Mengaktifkan kembali acara",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
