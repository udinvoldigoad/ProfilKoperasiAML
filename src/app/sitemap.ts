import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://agromulyolestari.girimulyo.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];
}