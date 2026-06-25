import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().trim().min(1, "Judul acara wajib diisi."),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal format YYYY-MM-DD."),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Jam mulai format HH:MM."),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Jam selesai format HH:MM."),
  location: z.string().trim().min(1, "Lokasi wajib diisi."),
  description: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["draft", "aktif", "selesai", "dibatalkan"])
});
