import { join } from "node:path";

export const PROFILE_PHOTO_MAX_FILE_SIZE = 4 * 1024 * 1024;

export const PROFILE_PHOTO_ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

const EXTENSION_CONTENT_TYPES = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"]
]);

const PROFILE_PHOTO_ROUTE_PREFIX = "/api/anggota/profil/foto/";

export function profilePhotoUploadDirectory() {
  return process.env.PROFILE_PHOTO_UPLOAD_DIR?.trim() || join(process.cwd(), "storage", "profile-photos");
}

export function profilePhotoPublicUrl(filename: string) {
  return `${PROFILE_PHOTO_ROUTE_PREFIX}${encodeURIComponent(filename)}`;
}

export function profilePhotoFilenameFromUrl(url?: string | null) {
  if (!url?.startsWith(PROFILE_PHOTO_ROUTE_PREFIX)) return null;

  const filename = decodeURIComponent(url.slice(PROFILE_PHOTO_ROUTE_PREFIX.length));
  return isSafeProfilePhotoFilename(filename) ? filename : null;
}

export function isSafeProfilePhotoFilename(filename: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,180}$/.test(filename);
}

export function profilePhotoContentType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPES.get(extension) ?? "application/octet-stream";
}
