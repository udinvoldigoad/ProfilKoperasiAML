import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/struktur", "/unit", "/pengumuman", "/kontak", "/login", "/signup"];
  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));
}
