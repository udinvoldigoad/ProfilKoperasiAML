import { join } from "node:path";

export function siteAssetUploadDirectory() {
  return process.env.SITE_ASSET_UPLOAD_DIR?.trim() || join(process.cwd(), "storage", "site-assets");
}

export function siteAssetSeedDirectory() {
  return join(process.cwd(), "site-assets");
}
