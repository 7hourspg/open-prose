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
  const last =
    recent[0]?.publishedAt ?? new Date().toISOString();
  const lastFmt = new Date(last).toISOString().slice(0, 10);

  return (
    <div
      className="px-5 py-8 md:px-14 md:py-10"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <section style={{ marginBottom: 48 }}>
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted-foreground)",
            margin: 0,
            padding: "12px 0",
            borderBottom: "1px dashed var(--border)",
          }}
        >{`# ~/index.md  ·  last updated ${lastFmt}`}</pre>
        {home ? (
          <div className="prose-developer" style={{ paddingTop: 12 }}>
            <MDX source={home} />
          </div>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--muted-foreground)",
              padding: "20px 0",
              fontStyle: "italic",
            }}
          >
            # (no intro yet)
          </p>
        )}
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              margin: 0,
              letterSpacing: 0.3,
            }}
          >
            ## recent posts
          </h2>
          <Link
            href="/blog"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--muted-foreground)",
              textDecoration: "none",
            }}
          >
            ls posts/ →
          </Link>
        </div>

        {recent.length === 0 ? (
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--muted-foreground)",
              padding: 16,
              background: "var(--code-bg)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              margin: 0,
            }}
          >
            {`$ ls posts/\n# (no posts yet) — check back soon.`}
          </pre>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recent.map((post) => (
              <li
                key={post.slug}
                className="flex flex-col gap-1 md:grid md:gap-5 md:items-baseline md:[grid-template-columns:110px_1fr]"
                style={{
                  padding: "16px 0",
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
                  {new Date(post.publishedAt).toISOString().slice(0, 10)}
                </div>
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      color: "var(--foreground)",
                      textDecoration: "none",
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      letterSpacing: -0.2,
                    }}
                  >
                    {post.title}
                  </Link>
                  {post.description && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--muted-foreground)",
                        lineHeight: 1.55,
                        margin: "4px 0 8px",
                      }}
                    >
                      {post.description}
                    </div>
                  )}
                  {post.tags.length > 0 && (
                    <div
                      style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                    >
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            padding: "2px 7px",
                            borderRadius: 3,
                            border: "1px solid var(--border)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
