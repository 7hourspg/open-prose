import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { collectionGraph, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  description: `All posts from ${site.name}.`,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    type: "website",
    title: "Blog",
    description: `All posts from ${site.name}.`,
    url: `${site.url}/blog`,
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
};

function monthKey(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function shortDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const all = getAllPosts().filter((p) => !p.noIndex);
  const recent = all.slice(0, 3);
  const archive = all.slice(3);

  // group archive by month
  const byMonth = new Map<string, typeof archive>();
  for (const p of archive) {
    const key = monthKey(p.date);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(p);
  }

  const formatLong = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      className="px-5 pt-12 pb-8 md:px-8 md:pt-16"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionGraph(all)) }}
      />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: -0.5,
          margin: "0 0 8px",
        }}
      >
        Blog
      </h1>
      <p
        style={{
          color: "var(--muted-foreground)",
          fontSize: 16,
          margin: "0 0 48px",
          fontStyle: "italic",
        }}
      >
        {all.length === 0
          ? "Nothing here yet — the first piece is in the kettle."
          : `${all.length} ${all.length === 1 ? "piece" : "pieces"}, slowly accumulating.`}
      </p>

      {recent.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px" }}>
          {recent.map((post) => (
            <li
              key={post.slug}
              style={{
                padding: "22px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  marginBottom: 4,
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    flex: 1,
                    color: "var(--foreground)",
                    textDecoration: "none",
                    fontSize: 19,
                    fontWeight: 500,
                    letterSpacing: -0.2,
                  }}
                >
                  {post.title}
                </Link>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {formatLong(post.publishedAt)}
                </span>
              </div>
              {post.description && (
                <div
                  style={{
                    fontSize: 15,
                    color: "var(--muted-foreground)",
                    lineHeight: 1.55,
                    marginBottom: 8,
                  }}
                >
                  {post.description}
                </div>
              )}
              {post.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    fontFamily: "var(--font-sans)",
                    fontSize: 11.5,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {post.tags.map((t) => (
                    <span key={t}>· {t}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {Array.from(byMonth.entries()).map(([month, items]) => (
        <section key={month} style={{ marginBottom: 36 }}>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              margin: "0 0 16px",
            }}
          >
            {month}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((it) => (
              <li
                key={it.slug}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  padding: "10px 0",
                  gap: 16,
                  borderBottom: "1px dotted var(--border)",
                }}
              >
                <Link
                  href={`/blog/${it.slug}`}
                  style={{
                    color: "var(--foreground)",
                    textDecoration: "none",
                    flex: 1,
                    fontSize: 16,
                  }}
                >
                  {it.title}
                </Link>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {shortDate(it.date)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
