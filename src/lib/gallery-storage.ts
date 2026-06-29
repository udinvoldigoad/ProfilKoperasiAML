import { join } from "node:path";

export const GALLERY_MAX_FILE_SIZE = 8 * 1024 * 1024;

export const GALLERY_ALLOWED_TYPES = new Map([
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

export function galleryUploadDirectory() {
  return process.env.GALLERY_UPLOAD_DIR?.trim() || join(process.cwd(), "storage", "gallery");
}

export function galleryPublicUrl(filename: string) {
  return `/api/galeri/file/${encodeURIComponent(filename)}`;
}

export function galleryFilenameFromUrl(url?: string | null) {
  if (!url) return null;
  const prefix = "/api/galeri/file/";
  if (!url.startsWith(prefix)) return null;
  const filename = decodeURIComponent(url.slice(prefix.length));
  return isSafeGalleryFilename(filename) ? filename : null;
}

export function isSafeGalleryFilename(filename: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,180}$/.test(filename);
}

export function galleryContentType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_CONTENT_TYPES.get(extension) ?? "application/octet-stream";
}
