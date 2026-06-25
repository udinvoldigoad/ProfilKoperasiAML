import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { changeMemberPassword } from "@/lib/db/members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberNikToAuthEmail } from "@/lib/auth-identifiers";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "anggota" || !session.member) {
    return NextResponse.json({ error: "Sesi anggota tidak ditemukan." }, { status: 401 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan data." }, { status: 503 });
  }

  let body: { newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const newPassword = (body.newPassword ?? "").trim();
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password baru minimal 8 karakter." }, { status: 400 });
  }

  const result = await changeMemberPassword(session.member.id, newPassword);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  // Changing the password revokes the old session, so re-issue a fresh one with
  // the new password — the member stays logged in and lands on the dashboard.
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signInWithPassword({
      email: memberNikToAuthEmail(session.member.nik),
      password: newPassword
    });
  }

  await logAudit({
    actorProfileId: session.profileId,
    action: "change_password",
    entityType: "members",
    entityId: session.member.id,
    summary: "Anggota mengganti password awal",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
