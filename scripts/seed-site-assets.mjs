import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const source = join(root, "site-assets");
const primaryTarget = process.env.SITE_ASSET_UPLOAD_DIR?.trim() || join(root, "storage", "site-assets");
const standaloneTarget = join(root, ".next", "standalone", "storage", "site-assets");

function copyMissing(sourcePath, targetPath) {
  const info = statSync(sourcePath);
  if (info.isDirectory()) {
    mkdirSync(targetPath, { recursive: true });
    for (const entry of readdirSync(sourcePath)) {
      copyMissing(join(sourcePath, entry), join(targetPath, entry));
    }
    return;
  }

  if (existsSync(targetPath)) return;
  mkdirSync(dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { force: false });
}

function seed(target) {
  if (!existsSync(source)) return;
  copyMissing(source, target);
}

seed(primaryTarget);
if (!process.env.SITE_ASSET_UPLOAD_DIR?.trim() && existsSync(join(root, ".next", "standalone"))) {
  seed(standaloneTarget);
}
