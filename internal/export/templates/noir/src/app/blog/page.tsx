import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { collectionGraph, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Writing",
  description: `Collected writing from ${site.name}.`,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    type: "website",
    title: "Writing",
    description: `Collected writing from ${site.name}.`,
    url: `${site.url}/blog`,
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
};

function yearGroup(date: string) {
  return String(new Date(date).getFullYear());
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

  const byYear = new Map<string, typeof archive>();
  for (const p of archive) {
    const y = yearGroup(p.publishedAt);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }

  return (
    <main
      className="px-5 pt-12 pb-12 md:px-8 md:pt-16"
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
      <div style={{ marginBottom: 44 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10.5,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          Writing
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(38px, 9vw, 56px)",
            fontWeight: 500,
            fontStyle: "italic",
            letterSpacing: -0.8,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Collected pieces.
        </h1>
      </div>

      {all.length === 0 && (
        <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
          Nothing yet — first piece is on the press.
        </p>
      )}

      {recent.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          {recent.map((post) => (
            <article
              key={post.slug}
              style={{
                padding: "26px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Link
                href={`/blog/${post.slug}`}
                style={{ color: "var(--foreground)", textDecoration: "none" }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    letterSpacing: -0.4,
                    margin: "0 0 8px",
                    lineHeight: 1.2,
                  }}
                >
                  {post.title}
                </h3>
                {post.description && (
                  <p
                    style={{
                      fontSize: 16.5,
                      color: "var(--muted-foreground)",
                      lineHeight: 1.55,
                      margin: "0 0 8px",
                      fontStyle: "italic",
                    }}
                  >
                    {post.description}
                  </p>
                )}
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {shortDate(post.publishedAt)}
                  {post.tags.length > 0 && (
                    <>
                      <span style={{ margin: "0 10px", opacity: 0.6 }}>·</span>
                      {post.tags.join(" · ")}
                    </>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </section>
      )}

      {Array.from(byYear.entries()).map(([year, items]) => (
        <section key={year} style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10.5,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontWeight: 600,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom:
                "1px solid color-mix(in oklab, var(--accent) 35%, transparent)",
            }}
          >
            {year}
          </div>
          {items.map((it) => (
            <div
              key={it.slug}
              style={{
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "baseline",
                gap: 16,
              }}
            >
              <Link
                href={`/blog/${it.slug}`}
                style={{
                  color: "var(--foreground)",
                  textDecoration: "none",
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  flex: 1,
                }}
              >
                {it.title}
              </Link>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  whiteSpace: "nowrap",
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                {shortDate(it.publishedAt)}
              </span>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
