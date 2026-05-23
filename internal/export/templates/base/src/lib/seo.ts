import {
  publisherLogo,
  publisherName,
  site,
} from "@/lib/site";
import type { Post } from "@/lib/content";

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

export function absUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function organizationNode() {
  const logoUrl = absUrl(publisherLogo);
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: publisherName,
    url: site.url,
    ...(logoUrl
      ? {
          logo: {
            "@type": "ImageObject",
            url: logoUrl,
          },
        }
      : {}),
    ...(site.socialUrls && site.socialUrls.length > 0
      ? { sameAs: site.socialUrls }
      : {}),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.locale || "en",
    publisher: { "@id": ORG_ID },
    ...(site.keywords && site.keywords.length > 0
      ? { keywords: site.keywords.join(", ") }
      : {}),
  };
}

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(), organizationNode()],
  };
}

export function countWords(text: string): number {
  if (!text) return 0;
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ");
  const matches = stripped.match(/\S+/g);
  return matches ? matches.length : 0;
}

export function articleGraph(post: Post) {
  const url = `${site.url}/blog/${post.slug}`;
  const author = post.author || site.author;
  const image = post.coverImage || site.ogImage;
  const wordCount = countWords(post.content);
  const article: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": url,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: site.locale || "en",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
  };
  if (author) {
    article.author = {
      "@type": "Person",
      name: author,
      url: site.url,
    };
  }
  if (image) {
    article.image = {
      "@type": "ImageObject",
      url: absUrl(image),
      width: 1200,
      height: 630,
    };
  }
  if (post.tags && post.tags.length > 0) {
    article.keywords = post.tags.join(", ");
    article.articleSection = post.tags[0];
  }
  if (wordCount > 0) {
    article.wordCount = wordCount;
  }

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${site.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [article, breadcrumb],
  };
}

export function collectionGraph(posts: Post[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/blog`,
    url: `${site.url}/blog`,
    name: "Blog",
    description: `All posts from ${site.name}.`,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: site.locale || "en",
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      ...(p.coverImage || site.ogImage
        ? { image: absUrl(p.coverImage || site.ogImage) }
        : {}),
    })),
  };
}

export function profileGraph() {
  const url = `${site.url}/about`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    inLanguage: site.locale || "en",
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "Person",
      name: site.author || site.name,
      url,
      ...(site.icon ? { image: absUrl(site.icon) } : {}),
      ...(site.socialUrls && site.socialUrls.length > 0
        ? { sameAs: site.socialUrls }
        : {}),
    },
  };
}

export function jsonLdScript(graph: unknown) {
  return JSON.stringify(graph);
}
