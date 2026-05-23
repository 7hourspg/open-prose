import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { collectionGraph, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Notebook",
  description: `All entries from ${site.name}.`,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    type: "website",
    title: "Notebook",
    description: `All entries from ${site.name}.`,
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
      className="px-5 pt-12 pb-10 md:px-8 md:pt-16"
      style={{
        maxWidth: 700,
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
          fontSize: 38,
          fontWeight: 500,
          fontStyle: "italic",
          letterSpacing: -0.6,
          margin: "0 0 8px",
        }}
      >
        Notebook
      </h1>
      <p
        style={{
          color: "var(--muted-foreground)",
          fontSize: 15.5,
          margin: "0 0 48px",
        }}
      >
        {all.length === 0
          ? "Pages still blank — the first entry is just ahead."
          : `${all.length} ${all.length === 1 ? "entry" : "entries"}, gathered slowly.`}
      </p>

      {recent.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px" }}>
          {recent.map((post) => (
            <li
              key={post.slug}
              style={{
                padding: "22px 0",
                borderBottom: "1px dashed var(--border)",
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
                    fontSize: 20,
                    fontWeight: 500,
                    letterSpacing: -0.2,
                  }}
                >
                  {post.title}
                </Link>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11.5,
                    color: "var(--muted-foreground)",
                    letterSpacing: 0.3,
                  }}
                >
                  {formatLong(post.publishedAt)}
                </span>
              </div>
              {post.description && (
                <div
                  style={{
                    fontSize: 15.5,
                    color: "var(--muted-foreground)",
                    lineHeight: 1.55,
                    fontStyle: "italic",
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
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    letterSpacing: 0.5,
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
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.18em",
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
                    fontSize: 11.5,
                    color: "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                    letterSpacing: 0.3,
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
