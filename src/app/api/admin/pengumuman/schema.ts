import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi."),
  body: z.string().trim().min(1, "Isi pengumuman wajib diisi."),
  category: z.string().trim().min(1, "Kategori wajib diisi."),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal format YYYY-MM-DD."),
  pinned: z.coerce.boolean().default(false)
});
