import { mkdir, readFile, stat, copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { NextResponse } from "next/server";
import { siteAssetContentType, siteAssetRelativePath } from "@/lib/site-assets";
import { siteAssetSeedDirectory, siteAssetUploadDirectory } from "@/lib/site-asset-storage";

export const runtime = "nodejs";

const defaultHeaders = {
  "Cache-Control": "public, max-age=86400"
} satisfies Record<string, string>;

function safePath(baseDirectory: string, relativePath: string) {
  const base = resolve(baseDirectory);
  const target = resolve(base, ...relativePath.split("/"));
  if (target !== base && !target.startsWith(`${base}\\`) && !target.startsWith(`${base}/`)) return null;
  return target;
}

async function readSeededAsset(relativePath: string) {
  const storagePath = safePath(siteAssetUploadDirectory(), relativePath);
  const seedPath = safePath(siteAssetSeedDirectory(), relativePath);
  if (!storagePath || !seedPath) return null;

  try {
    return await readFile(storagePath);
  } catch {
    // Continue with seed fallback below.
  }

  try {
    const seedInfo = await stat(seedPath);
    if (!seedInfo.isFile()) return null;
    const bytes = await readFile(seedPath);
    await mkdir(dirname(storagePath), { recursive: true });
    await copyFile(seedPath, storagePath).catch(() => undefined);
    return bytes;
  } catch {
    return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const relativePath = siteAssetRelativePath(path ?? []);
  if (!relativePath) return NextResponse.json({ error: "Path aset tidak valid." }, { status: 400 });

  const bytes = await readSeededAsset(relativePath);
  if (!bytes) return NextResponse.json({ error: "Aset tidak ditemukan." }, { status: 404 });

  return new NextResponse(bytes, {
    headers: {
      ...defaultHeaders,
      "Content-Type": siteAssetContentType(relativePath)
    }
  });
}
