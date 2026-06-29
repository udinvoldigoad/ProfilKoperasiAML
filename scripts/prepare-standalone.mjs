import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

function copyIfExists(source, target) {
  if (!existsSync(source)) return;
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true, force: true });
}

copyIfExists(join(root, "public"), join(standaloneDir, "public"));
copyIfExists(join(root, ".next", "static"), join(standaloneDir, ".next", "static"));