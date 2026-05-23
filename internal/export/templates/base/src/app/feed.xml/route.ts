import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts().filter((p) => !p.noIndex);
  const lastBuild = posts.length > 0 ? new Date(posts[0].updatedAt) : new Date();

  const items = posts
    .map((p) => {
      const author = p.author || site.author;
      const categories = (p.tags ?? [])
        .map((t) => `      <category>${escape(t)}</category>`)
        .join("\n");
      const enclosure = p.coverImage
        ? `      <enclosure url="${site.url}${p.coverImage}" type="image/jpeg" length="0" />`
        : "";
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${site.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escape(p.description)}</description>
${author ? `      <dc:creator>${escape(author)}</dc:creator>\n` : ""}${categories ? `${categories}\n` : ""}${enclosure ? `${enclosure}\n` : ""}    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(site.name)}</title>
    <link>${site.url}</link>
    <description>${escape(site.description)}</description>
    <language>${escape(site.locale || "en")}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
