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
      className="px-5 pt-10 pb-16 md:px-8 md:pt-14"
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
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            marginBottom: 10,
          }}
        >
          Blog
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 10vw, 56px)",
            fontWeight: 700,
            letterSpacing: -0.8,
            margin: 0,
            lineHeight: 1,
          }}
        >
          All posts.
        </h1>
      </div>

      {all.length === 0 && (
        <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>
          No posts yet — they are being typeset.
        </p>
      )}

      {recent.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--accent)",
              fontWeight: 600,
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: "2px solid var(--foreground)",
            }}
          >
            Latest
          </div>
          {recent.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col gap-1.5 md:grid md:gap-6 md:items-baseline md:[grid-template-columns:120px_1fr_110px]"
              style={{
                padding: "22px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10.5,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                {post.tags[0] ?? "Essay"}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    margin: "0 0 6px",
                    lineHeight: 1.2,
                  }}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ color: "var(--foreground)", textDecoration: "none" }}
                  >
                    {post.title}
                  </Link>
                </h3>
                {post.description && (
                  <p
                    style={{
                      fontSize: 14.5,
                      color: "var(--muted-foreground)",
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {post.description}
                  </p>
                )}
              </div>
              <div
                className="text-left md:text-right"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                {shortDate(post.publishedAt)}
              </div>
            </article>
          ))}
        </section>
      )}

      {Array.from(byYear.entries()).map(([year, items]) => (
        <section key={year} style={{ marginBottom: 36 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              fontWeight: 600,
              marginBottom: 16,
              paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
            }}
          >
            {year}
          </div>
          {items.map((it) => (
            <div
              key={it.slug}
              className="flex flex-col gap-1 md:grid md:gap-6 md:items-baseline md:[grid-template-columns:120px_1fr_110px]"
              style={{
                padding: "14px 0",
                borderBottom: "1px dotted var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 10.5,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {it.tags[0] ?? "Essay"}
              </div>
              <Link
                href={`/blog/${it.slug}`}
                style={{
                  color: "var(--foreground)",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {it.title}
              </Link>
              <div
                className="text-left md:text-right"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                {shortDate(it.publishedAt)}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
