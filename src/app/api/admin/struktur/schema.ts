import { z } from "zod";

export const boardMemberSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  position: z.string().trim().min(1, "Jabatan wajib diisi."),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  contact: z.string().trim().optional().or(z.literal("")),
  period: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int("Urutan harus bilangan bulat.").min(0, "Urutan tidak boleh negatif.")
});
