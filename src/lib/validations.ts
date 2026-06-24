import { z } from "zod";

export const memberSchema = z.object({
  memberNumber: z.string().min(1, "No anggota wajib diisi"),
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().regex(/^\d{16}$/, "NIK wajib 16 digit angka"),
  birthPlace: z.string().min(2, "Tempat lahir wajib diisi"),
  birthDate: z.string().refine((value) => new Date(value) <= new Date(), {
    message: "Tanggal lahir tidak boleh di masa depan"
  }),
  address: z.string().min(6, "Alamat wajib diisi"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().min(8, "No HP terlalu pendek").optional().or(z.literal("")),
  memberType: z.enum(["anggota_lama", "anggota_baru"]),
  status: z.enum(["aktif", "nonaktif", "ditangguhkan"])
});

export const eventSchema = z.object({
  title: z.string().min(3, "Judul acara wajib diisi"),
  date: z.string().min(1, "Tanggal acara wajib diisi"),
  startTime: z.string().min(1, "Jam mulai wajib diisi"),
  endTime: z.string().min(1, "Jam selesai wajib diisi"),
  location: z.string().min(3, "Lokasi wajib diisi"),
  description: z.string().min(6, "Deskripsi wajib diisi"),
  status: z.enum(["draft", "aktif", "selesai", "dibatalkan"])
});


export const memberLoginSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, "NIK wajib 16 digit angka"),
  password: z.string().min(1, "Password wajib diisi")
});

export const adminLoginSchema = z.object({
  email: z.string().email("Format email admin tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});
export function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "NIK atau password salah.";
  if (lower.includes("email not confirmed")) return "Email belum dikonfirmasi.";
  if (lower.includes("rate limit")) return "Terlalu banyak percobaan. Coba beberapa saat lagi.";
  return "Terjadi kendala autentikasi. Silakan coba lagi.";
}

