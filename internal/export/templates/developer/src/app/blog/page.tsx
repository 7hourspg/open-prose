import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { collectionGraph, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "posts",
  description: `All posts from ${site.name}.`,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    type: "website",
    title: "posts",
    description: `All posts from ${site.name}.`,
    url: `${site.url}/blog`,
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
};

function isoDate(d: string) {
  return new Date(d).toISOString().slice(0, 10);
}

function yearOf(d: string) {
  return String(new Date(d).getFullYear());
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        padding: "2px 7px",
        borderRadius: 3,
        border: "1px solid var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      #{children}
    </span>
  );
}

export default function BlogIndex() {
  const all = getAllPosts().filter((p) => !p.noIndex);
  const recent = all.slice(0, 3);
  const archive = all.slice(3);

  const byYear = new Map<string, typeof archive>();
  for (const p of archive) {
    const y = yearOf(p.publishedAt);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }

  return (
    <main
      className="px-5 py-7 md:px-14 md:py-8"
      style={{
        maxWidth: 980,
        margin: "0 auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionGraph(all)) }}
      />
      <pre
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--muted-foreground)",
          margin: 0,
          padding: "0 0 8px",
          borderBottom: "1px dashed var(--border)",
        }}
      >
        {`$ ls -lh posts/ | wc -l\n     ${all.length}`}
      </pre>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          margin: "24px 0 16px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            color: "var(--foreground)",
          }}
        >
          # posts
        </h1>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted-foreground)",
          }}
        >
          sort: <span style={{ color: "var(--accent)" }}>date</span> · order: desc
        </div>
      </div>

      {all.length === 0 ? (
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--muted-foreground)",
            padding: 16,
            background: "var(--code-bg)",
            border: "1px solid var(--border)",
            borderRadius: 4,
          }}
        >
          {`$ ls posts/\n# (no posts yet)`}
        </pre>
      ) : (
        <>
          <div
            className="hidden md:grid md:gap-5 md:[grid-template-columns:110px_1fr_220px]"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--muted-foreground)",
              padding: "10px 0",
              borderBottom: "1px solid var(--border)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <div>date</div>
            <div>title</div>
            <div>tags</div>
          </div>

          {recent.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col gap-1.5 md:grid md:gap-5 md:items-baseline md:[grid-template-columns:110px_1fr_220px]"
              style={{
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                }}
              >
                {isoDate(post.publishedAt)}
              </div>
              <div>
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: "var(--foreground)",
                    textDecoration: "none",
                    fontFamily: "var(--font-mono)",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: -0.2,
                  }}
                >
                  {post.title}
                </Link>
                {post.description && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted-foreground)",
                      marginTop: 3,
                    }}
                  >
                    {post.description}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {post.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </article>
          ))}
        </>
      )}

      {Array.from(byYear.entries()).map(([year, items]) => (
        <section key={year} style={{ marginTop: 28 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              margin: "12px 0",
              letterSpacing: 0.3,
            }}
          >
            # {year}
          </h2>
          {items.map((it) => (
            <div
              key={it.slug}
              className="flex flex-col gap-1 md:grid md:gap-5 md:items-baseline md:[grid-template-columns:110px_1fr_220px]"
              style={{
                padding: "10px 0",
                borderBottom: "1px dotted var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                }}
              >
                {isoDate(it.publishedAt)}
              </div>
              <Link
                href={`/blog/${it.slug}`}
                style={{
                  color: "var(--foreground)",
                  textDecoration: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                }}
              >
                {it.title}
              </Link>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {it.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
