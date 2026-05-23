import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { collectionGraph, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Letters",
  description: `All letters from ${site.name}.`,
  alternates: { canonical: `${site.url}/blog` },
  openGraph: {
    type: "website",
    title: "Letters",
    description: `All letters from ${site.name}.`,
    url: `${site.url}/blog`,
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
};

function fullDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const all = getAllPosts().filter((p) => !p.noIndex);

  return (
    <main
      className="px-5 pt-10 pb-12 md:px-8 md:pt-14"
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

      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}
        >
          The archive
        </div>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: -0.6,
            margin: "0 0 6px",
            lineHeight: 1.15,
          }}
        >
          Every letter, in order.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--muted-foreground)",
            margin: 0,
          }}
        >
          {all.length === 0
            ? "The first letter is on its way."
            : `${all.length} letter${all.length === 1 ? "" : "s"} so far.`}
        </p>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {all.map((post) => (
          <li
            key={post.slug}
            style={{
              padding: "22px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <Link
              href={`/blog/${post.slug}`}
              style={{ color: "var(--foreground)", textDecoration: "none" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {fullDate(post.publishedAt)}
                {post.tags.length > 0 && (
                  <>
                    <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
                    {post.tags.slice(0, 3).join(" · ")}
                  </>
                )}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.3,
                  lineHeight: 1.22,
                  marginBottom: post.description ? 6 : 0,
                }}
              >
                {post.title}
              </div>
              {post.description && (
                <div
                  style={{
                    fontSize: 15.5,
                    color: "var(--muted-foreground)",
                    lineHeight: 1.55,
                  }}
                >
                  {post.description}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
