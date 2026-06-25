import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { SITE_PROFILE_TAG, updateSiteProfile } from "@/lib/db/settings";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import { settingsSchema } from "./schema";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan data." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const result = await updateSiteProfile(parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  // Purge the cached profile so the footer and public pages reflect the change.
  revalidateTag(SITE_PROFILE_TAG);

  await logAudit({
    actorProfileId: session.profileId,
    action: "update",
    entityType: "settings",
    summary: "Memperbarui pengaturan profil koperasi",
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true });
}
