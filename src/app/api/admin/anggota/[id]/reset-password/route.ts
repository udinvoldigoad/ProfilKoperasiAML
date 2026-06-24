import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resetMemberPassword } from "@/lib/db/members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan data." }, { status: 503 });
  }

  const { id } = await params;
  const result = await resetMemberPassword(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await logAudit({
    actorProfileId: session.profileId,
    action: "reset_password",
    entityType: "members",
    entityId: id,
    summary: "Reset password anggota",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, password: result.password });
}
