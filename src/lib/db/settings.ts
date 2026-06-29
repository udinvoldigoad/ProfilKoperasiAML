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

function editableProfileFields(value: unknown): Partial<SiteProfileInput> {
  if (!value || typeof value !== "object") return {};
  const source = value as Partial<SiteProfileInput>;
  return {
    name: source.name,
    village: source.village,
    district: source.district,
    regency: source.regency,
    address: source.address,
    whatsapp: source.whatsapp,
    email: source.email,
    operationalHours: source.operationalHours
  };
}

/**
 * Cached read of the site profile: stored editable fields merged over the
 * static defaults. Image paths stay code-controlled so stale DB settings cannot
 * point the public page at missing files.
 */
export const getSiteProfile = unstable_cache(
  async (): Promise<SiteProfile> => {
    if (!isSupabaseConfigured()) return defaultSiteProfile;

    const admin = createSupabaseAdminClient();
    if (!admin) return defaultSiteProfile;

    const { data, error } = await admin.from("settings").select("value").eq("key", SITE_PROFILE_KEY).maybeSingle();

    if (error || !data?.value) return defaultSiteProfile;
    return { ...defaultSiteProfile, ...editableProfileFields(data.value) };
  },
  ["site-profile", "static-image-fields-v2"],
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
