import { unstable_cache } from "next/cache";
import { siteProfile as defaultSiteProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SiteProfile = typeof defaultSiteProfile;
export type SiteProfileInput = Pick<
  SiteProfile,
  "name" | "village" | "district" | "regency" | "address" | "whatsapp" | "email" | "operationalHours"
>;

export const SITE_PROFILE_TAG = "site-profile";
const SITE_PROFILE_KEY = "site_profile";

export type MutationResult = { ok: true } | { ok: false; error: string };

/**
 * Cached read of the site profile: stored editable fields merged over the
 * static defaults. Tagged so admin saves can purge it via revalidateTag,
 * which keeps public pages statically cached yet fresh after an edit.
 */
export const getSiteProfile = unstable_cache(
  async (): Promise<SiteProfile> => {
    if (!isSupabaseConfigured()) return defaultSiteProfile;

    const admin = createSupabaseAdminClient();
    if (!admin) return defaultSiteProfile;

    const { data, error } = await admin.from("settings").select("value").eq("key", SITE_PROFILE_KEY).maybeSingle();

    if (error || !data?.value) return defaultSiteProfile;
    return { ...defaultSiteProfile, ...(data.value as Partial<SiteProfile>) };
  },
  ["site-profile"],
  { tags: [SITE_PROFILE_TAG] }
);

/** Upserts the editable site-profile fields. Caller should revalidateTag(SITE_PROFILE_TAG). */
export async function updateSiteProfile(input: SiteProfileInput): Promise<MutationResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Service role belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY)." };

  const { error } = await admin
    .from("settings")
    .upsert({ key: SITE_PROFILE_KEY, value: input }, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
