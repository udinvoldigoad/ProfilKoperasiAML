import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://agromulyolestari.girimulyo.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
    },
  ];
}