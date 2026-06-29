import { createHash } from "node:crypto";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const GUEST_TTL_DAYS = 7;

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function guestIdentityKey(name: string, origin: string) {
  const normalized = `${normalizeText(name)}|${normalizeText(origin)}`;
  return createHash("sha256").update(normalized).digest("hex");
}

export function guestExpiresAt(now = new Date()) {
  return new Date(now.getTime() + GUEST_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function cleanupExpiredGuests() {
  if (!isDatabaseConfigured()) return 0;

  const now = new Date();
  try {
    const expired = await prisma.guest.findMany({
      where: { expiresAt: { lt: now } },
      select: { id: true }
    });
    const ids = expired.map((guest) => guest.id);
    if (ids.length === 0) return 0;

    await prisma.$transaction([
      prisma.guestAttendance.deleteMany({ where: { guestId: { in: ids } } }),
      prisma.guest.deleteMany({ where: { id: { in: ids } } })
    ]);
    return ids.length;
  } catch {
    return 0;
  }
}

export type GuestLoginResult =
  | { ok: true; guest: { id: string; name: string; origin: string; expiresAt: Date } }
  | { ok: false; error: string };

export async function loginGuest(input: { name: string; origin: string }): Promise<GuestLoginResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  const name = input.name.replace(/\s+/g, " ").trim();
  const origin = input.origin.replace(/\s+/g, " ").trim();

  if (name.length < 2) return { ok: false, error: "Nama tamu minimal 2 karakter." };
  if (origin.length < 2) return { ok: false, error: "Asal atau instansi minimal 2 karakter." };

  await cleanupExpiredGuests();

  try {
    const identityKey = guestIdentityKey(name, origin);
    const guest = await prisma.guest.upsert({
      where: { identityKey },
      update: {
        name,
        origin,
        expiresAt: guestExpiresAt()
      },
      create: {
        name,
        origin,
        identityKey,
        expiresAt: guestExpiresAt()
      },
      select: { id: true, name: true, origin: true, expiresAt: true }
    });

    return { ok: true, guest };
  } catch {
    return { ok: false, error: "Gagal menyimpan identitas tamu." };
  }
}
