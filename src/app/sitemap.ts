import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thenicepicnic.com"
).replace(/\/$/, "");

const paths = [
  "",
  "/galerie",
  "/contact",
  "/reservation",
  "/cgv",
  "/mentions-legales",
  "/bon-cadeau",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    const frUrl = `${siteUrl}${path}`;
    const enUrl = `${siteUrl}/en${path}`;

    entries.push({
      url: frUrl,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/reservation" ? 0.9 : 0.7,
      alternates: { languages: { fr: frUrl, en: enUrl } },
    });

    entries.push({
      url: enUrl,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 0.95 : path === "/reservation" ? 0.85 : 0.65,
      alternates: { languages: { fr: frUrl, en: enUrl } },
    });
  }

  return entries;
}
