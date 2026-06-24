export function normalizeNik(value: string) {
  return value.replace(/\D/g, "").slice(0, 16);
}

export function memberNikToAuthEmail(nik: string) {
  const domain = process.env.MEMBER_AUTH_EMAIL_DOMAIN || "anggota.agrimulyolestari.local";
  return `${normalizeNik(nik)}@${domain}`;
}

export function isValidNik(value: string) {
  return /^\d{16}$/.test(normalizeNik(value));
}
