import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { hashPassword } from "@/lib/passwords";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }

  let body: { newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const newPassword = body.newPassword?.trim() ?? "";
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password admin minimal 8 karakter." }, { status: 400 });
  }

  await prisma.profile.update({
    where: { id: session.profileId },
    data: {
      passwordHash: hashPassword(newPassword),
      mustChangePassword: false
    }
  });

  await logAudit({
    actorProfileId: session.profileId,
    action: "reset_password",
    entityType: "profiles",
    entityId: session.profileId,
    summary: "Reset password admin",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
