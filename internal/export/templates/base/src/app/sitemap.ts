import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { hasAbout, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => !p.noIndex);
  const latest = posts.length > 0 ? new Date(posts[0].updatedAt) : new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/blog`,
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...posts.map((p) => {
      const image = p.coverImage
        ? `${site.url}${p.coverImage}`
        : site.ogImage
          ? `${site.url}${site.ogImage}`
          : "";
      const entry: MetadataRoute.Sitemap[number] = {
        url: `${site.url}/blog/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      };
      if (image) entry.images = [image];
      return entry;
    }),
  ];
  if (hasAbout) {
    entries.push({
      url: `${site.url}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }
  return entries;
}
