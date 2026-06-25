import { z } from "zod";

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "Nama koperasi wajib diisi."),
  village: z.string().trim().min(1, "Nama desa wajib diisi."),
  district: z.string().trim().min(1, "Kecamatan wajib diisi."),
  regency: z.string().trim().min(1, "Kabupaten wajib diisi."),
  address: z.string().trim().min(1, "Alamat wajib diisi."),
  whatsapp: z.string().trim().min(1, "Nomor WhatsApp wajib diisi."),
  email: z.string().trim().email("Email tidak valid.").or(z.literal("")),
  operationalHours: z.string().trim().min(1, "Jam operasional wajib diisi.")
});
