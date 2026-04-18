import type { MetadataRoute } from "next";

import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of site.locales) {
    entries.push({
      url: `${site.url}/${locale}`,
      changeFrequency: "weekly",
      priority: 1,
    });
    entries.push({
      url: `${site.url}/${locale}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    const articles = await listArticles(locale);
    for (const a of articles) {
      entries.push({
        url: `${site.url}/${locale}/articles/${a.slug}`,
        lastModified: a.updatedAt ?? a.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
