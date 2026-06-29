import type { NextRequest } from "next/server";
import type { AuditLog } from "@/types";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

/** Best-effort client IP from proxy headers. */
export function clientIp(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
}

export type AuditEntry = {
  actorProfileId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  ipAddress?: string | null;
};

/** Records an admin action. Best-effort: failures never block the main request. */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!isDatabaseConfigured()) return;

  try {
    await prisma.auditLog.create({
      data: {
        actorProfileId: entry.actorProfileId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        summary: entry.summary,
        ipAddress: entry.ipAddress ?? null
      }
    });
  } catch {
    // Audit logging must never break the action it describes.
  }
}

/** Recent audit entries, newest first, with the actor resolved to a label. */
export async function listAuditLogs(limit = 50): Promise<AuditLog[]> {
  if (!isDatabaseConfigured()) return [];

  try {
    const rows = await prisma.auditLog.findMany({
      include: { actor: { select: { email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return rows.map((row) => ({
      id: row.id,
      actor: row.actor?.email ?? (row.actor?.role === "admin" ? "Admin" : "Sistem"),
      action: row.action,
      entityType: row.entityType,
      summary: row.summary,
      createdAt: row.createdAt.toISOString()
    }));
  } catch {
    return [];
  }
}