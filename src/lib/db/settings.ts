import { unstable_cache } from "next/cache";
import { siteProfile as defaultSiteProfile } from "@/lib/data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

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

/** Cached read of the site profile. Image paths stay code-controlled. */
export const getSiteProfile = unstable_cache(
  async (): Promise<SiteProfile> => {
    if (!isDatabaseConfigured()) return defaultSiteProfile;

    try {
      const data = await prisma.setting.findUnique({ where: { key: SITE_PROFILE_KEY }, select: { value: true } });
      if (!data?.value) return defaultSiteProfile;
      return { ...defaultSiteProfile, ...editableProfileFields(data.value) };
    } catch {
      return defaultSiteProfile;
    }
  },
  ["site-profile", "mysql-static-image-fields-v1"],
  { tags: [SITE_PROFILE_TAG] }
);

/** Upserts the editable site-profile fields. Caller should revalidateTag(SITE_PROFILE_TAG). */
export async function updateSiteProfile(input: SiteProfileInput): Promise<MutationResult> {
  if (!isDatabaseConfigured()) return { ok: false, error: "Database MySQL belum dikonfigurasi (DATABASE_URL)." };

  try {
    await prisma.setting.upsert({
      where: { key: SITE_PROFILE_KEY },
      update: { value: input },
      create: { key: SITE_PROFILE_KEY, value: input }
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Gagal menyimpan pengaturan." };
  }
}