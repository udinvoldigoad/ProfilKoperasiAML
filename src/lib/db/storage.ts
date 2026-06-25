import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MANAGED_BUCKETS = new Set(["board-photos", "unit-photos", "member-photos"]);
const PUBLIC_MARKER = "/storage/v1/object/public/";

/**
 * Deletes an uploaded image from Supabase Storage given its public URL.
 * No-op for empty values, external URLs, or static /images paths — only
 * files in our managed buckets are removed. Never throws.
 */
export async function deleteUploadedImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const idx = url.indexOf(PUBLIC_MARKER);
  if (idx === -1) return;

  const rest = url.slice(idx + PUBLIC_MARKER.length); // "<bucket>/<path>"
  const slash = rest.indexOf("/");
  if (slash === -1) return;

  const bucket = rest.slice(0, slash);
  const path = decodeURIComponent(rest.slice(slash + 1).split("?")[0]);
  if (!MANAGED_BUCKETS.has(bucket) || !path) return;

  const admin = createSupabaseAdminClient();
  if (!admin) return;

  try {
    await admin.storage.from(bucket).remove([path]);
  } catch {
    // Storage cleanup is best-effort and must never break the main action.
  }
}
