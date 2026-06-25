import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().trim().min(1, "Nama unit wajib diisi."),
  type: z.string().trim().min(1, "Tipe unit wajib diisi."),
  address: z.string().trim().min(1, "Alamat wajib diisi."),
  latitude: z.coerce.number().min(-90, "Latitude tidak valid.").max(90, "Latitude tidak valid."),
  longitude: z.coerce.number().min(-180, "Longitude tidak valid.").max(180, "Longitude tidak valid."),
  contact: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(1, "Deskripsi wajib diisi."),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  mapsUrl: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["aktif", "nonaktif"])
});
