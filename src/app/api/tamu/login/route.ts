import { NextRequest, NextResponse } from "next/server";
import { loginGuest } from "@/lib/db/guests";
import { setGuestSessionCookie, signGuestSession } from "@/lib/guest-session";

function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/presensi/scan";
  return value;
}

export async function POST(request: NextRequest) {
  let body: { name?: string; phone?: string; next?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const result = await loginGuest({ name: body.name ?? "", phone: body.phone ?? "" });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const token = await signGuestSession({
    guestId: result.guest.id,
    name: result.guest.name,
    phone: result.guest.phone
  });

  const response = NextResponse.json({ ok: true, redirectTo: safeNext(body.next) });
  setGuestSessionCookie(response, token);
  return response;
}
