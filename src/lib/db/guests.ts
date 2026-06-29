import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const GUEST_TTL_DAYS = 7;

export function normalizeGuestPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export function displayGuestPhone(value: string) {
  const normalized = normalizeGuestPhone(value);
  if (normalized.startsWith("62")) return `0${normalized.slice(2)}`;
  return normalized;
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
  | { ok: true; guest: { id: string; name: string; phone: string; expiresAt: Date } }
  | { ok: false; error: string };

export async function loginGuest(input: { name: string; phone: string }): Promise<GuestLoginResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi." };

  const name = input.name.replace(/\s+/g, " ").trim();
  const normalizedPhone = normalizeGuestPhone(input.phone);
  const phone = displayGuestPhone(input.phone);

  if (name.length < 2) return { ok: false, error: "Nama tamu minimal 2 karakter." };
  if (normalizedPhone.length < 9 || normalizedPhone.length > 16) {
    return { ok: false, error: "Nomor HP tamu tidak valid." };
  }

  await cleanupExpiredGuests();

  try {
    const guest = await prisma.guest.upsert({
      where: { normalizedPhone },
      update: {
        name,
        phone,
        expiresAt: guestExpiresAt()
      },
      create: {
        name,
        phone,
        normalizedPhone,
        expiresAt: guestExpiresAt()
      },
      select: { id: true, name: true, phone: true, expiresAt: true }
    });

    return { ok: true, guest };
  } catch {
    return { ok: false, error: "Gagal menyimpan identitas tamu." };
  }
}
