import type { Metadata } from "next";
import Link from "next/link";
import { MDX } from "@/lib/mdx";
import { getHomeMDX, getRecentPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  alternates: { canonical: site.url },
};

export default function Home() {
  const home = getHomeMDX();
  const recent = getRecentPosts(3);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      className="px-5 pt-12 pb-8 md:px-8 md:pt-16"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      {home && (
        <section style={{ marginBottom: 56 }} className="prose-minimal">
          <MDX source={home} />
        </section>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 32 }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            margin: "0 0 24px",
          }}
        >
          Recent posts
        </h2>

        {recent.length === 0 ? (
          <p
            style={{
              color: "var(--muted-foreground)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Nothing here yet — the first piece is in the kettle.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recent.map((post) => (
              <li
                key={post.slug}
                style={{
                  padding: "20px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ color: "var(--foreground)", textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 16,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        letterSpacing: -0.2,
                        flex: 1,
                      }}
                    >
                      {post.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(post.date)}
                    </span>
                  </div>
                  {post.description && (
                    <div
                      style={{
                        fontSize: 15.5,
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                      }}
                    >
                      {post.description}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div
          style={{
            marginTop: 28,
            fontFamily: "var(--font-sans)",
            fontSize: 13.5,
          }}
        >
          <Link
            href="/blog"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              borderBottom:
                "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
              paddingBottom: 1,
            }}
          >
            All posts →
          </Link>
        </div>
      </div>
    </div>
  );
}
