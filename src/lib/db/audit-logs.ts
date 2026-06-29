import type { NextRequest } from "next/server";
import type { AuditLog } from "@/types";
import { auditLogs as fallbackAuditLogs } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

/**
 * Records an admin action. Best-effort: failures never block the main request,
 * and nothing is written in local fallback mode (no service role).
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const admin = createSupabaseAdminClient();
  if (!admin) return;

  try {
    await admin.from("audit_logs").insert({
      actor_profile_id: entry.actorProfileId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary,
      ip_address: entry.ipAddress ?? null
    });
  } catch {
    // Audit logging must never break the action it describes.
  }
}

type AuditLogRow = {
  id: string;
  action: string;
  entity_type: string;
  summary: string;
  created_at: string;
  actor: { email: string | null; role: string | null } | null;
};

/** Recent audit entries, newest first, with the actor resolved to a label. */
export async function listAuditLogs(limit = 50): Promise<AuditLog[]> {
  if (!isSupabaseConfigured()) return fallbackAuditLogs;
  const admin = createSupabaseAdminClient();
  if (!admin) return fallbackAuditLogs;

  const { data, error } = await admin
    .from("audit_logs")
    .select("id, action, entity_type, summary, created_at, actor:profiles!actor_profile_id(email, role)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as AuditLogRow[]).map((row) => ({
    id: row.id,
    actor: row.actor?.email ?? (row.actor?.role === "admin" ? "Admin" : "Sistem"),
    action: row.action,
    entityType: row.entity_type,
    summary: row.summary,
    createdAt: row.created_at
  }));
}
