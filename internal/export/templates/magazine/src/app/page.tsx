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
  const posts = getRecentPosts(3);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main
      className="px-5 pt-12 pb-8 md:px-8 md:pt-16"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      {home && (
        <article className="prose-magazine" style={{ marginBottom: 56 }}>
          <MDX source={home} />
        </article>
      )}

      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 32 }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            margin: "0 0 24px",
          }}
        >
          Recent posts
        </h2>

        {posts.length === 0 ? (
          <p
            style={{
              color: "var(--muted-foreground)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            No posts yet — subscribe via RSS to hear of the first.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {posts.map((post) => (
              <li
                key={post.slug}
                style={{
                  padding: "22px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: "var(--foreground)",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(20px, 5vw, 26px)",
                      fontWeight: 700,
                      letterSpacing: -0.4,
                      lineHeight: 1.18,
                      margin: "0 0 6px",
                    }}
                  >
                    {post.title}
                  </h3>
                  {post.description && (
                    <p
                      style={{
                        fontSize: 15.5,
                        color: "var(--muted-foreground)",
                        lineHeight: 1.55,
                        margin: "0 0 6px",
                      }}
                    >
                      {post.description}
                    </p>
                  )}
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 11.5,
                      color: "var(--muted-foreground)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {formatDate(post.date)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div
          style={{
            marginTop: 28,
            fontFamily: "var(--font-sans)",
            fontSize: 11.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <Link
            href="/blog"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            All posts →
          </Link>
        </div>
      </section>
    </main>
  );
}
