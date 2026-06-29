import { cookies } from "next/headers";
import { GUEST_SESSION_COOKIE, verifyGuestSessionToken } from "@/lib/guest-session";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type SessionGuest = {
  id: string;
  name: string;
  origin: string;
  expiresAt: string;
};

export async function getSessionGuest(): Promise<SessionGuest | null> {
  const cookieStore = await cookies();
  const claims = await verifyGuestSessionToken(cookieStore.get(GUEST_SESSION_COOKIE)?.value);
  if (!claims || !isDatabaseConfigured()) return null;

  try {
    const guest = await prisma.guest.findUnique({ where: { id: claims.guestId } });
    if (!guest || guest.expiresAt.getTime() < Date.now()) return null;

    return {
      id: guest.id,
      name: guest.name,
      origin: guest.origin,
      expiresAt: guest.expiresAt.toISOString()
    };
  } catch {
    return null;
  }
}
