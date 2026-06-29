import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function parseDatabaseUrl(rawValue: string | undefined) {
  const raw = rawValue ?? "";
  const trimmed = raw.trim();

  const base = {
    configured: Boolean(trimmed),
    rawLength: raw.length,
    trimmedLength: trimmed.length,
    hasLeadingOrTrailingWhitespace: raw !== trimmed,
    urlFingerprint: trimmed ? fingerprint(trimmed) : null
  };

  if (!trimmed) return base;

  try {
    const url = new URL(trimmed);
    const password = decodeURIComponent(url.password);

    return {
      ...base,
      protocol: url.protocol,
      host: url.hostname,
      port: url.port || null,
      database: decodeURIComponent(url.pathname.replace(/^\//, "")),
      username: decodeURIComponent(url.username),
      passwordLength: password.length,
      passwordFingerprint: fingerprint(password),
      queryKeys: Array.from(url.searchParams.keys())
    };
  } catch (error) {
    return {
      ...base,
      parseError: error instanceof Error ? error.message : "DATABASE_URL tidak valid"
    };
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret || request.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const databaseUrl = parseDatabaseUrl(process.env.DATABASE_URL);

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, databaseUrl, connection: { ok: true } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      databaseUrl,
      connection: {
        ok: false,
        message: error instanceof Error ? error.message : "Koneksi database gagal"
      }
    });
  }
}