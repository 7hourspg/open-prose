import type { Metadata } from "next";
import Link from "next/link";
import { MDX } from "@/lib/mdx";
import { getHomeMDX, getRecentPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.name,
  alternates: { canonical: site.url },
};

function authorInitial() {
  return (site.author || site.name || "?").trim().charAt(0).toUpperCase();
}

export default function Home() {
  const home = getHomeMDX();
  const recent = getRecentPosts(5);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      className="px-5 pt-10 pb-12 md:px-8 md:pt-14"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      <section
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 48,
          paddingBottom: 32,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {site.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.icon}
            alt={site.author || site.name}
            width={64}
            height={64}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              flexShrink: 0,
              border: "1px solid var(--border)",
            }}
          />
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {authorInitial()}
          </div>
        )}
        <div style={{ minWidth: 0, paddingTop: 4 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -0.4,
              margin: "0 0 4px",
              lineHeight: 1.15,
            }}
          >
            {site.name}
          </h1>
          {site.author && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                color: "var(--muted-foreground)",
                marginBottom: site.description ? 8 : 0,
              }}
            >
              by {site.author}
            </div>
          )}
          {site.description && (
            <p
              style={{
                fontSize: 16,
                color: "var(--muted-foreground)",
                lineHeight: 1.55,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {site.description}
            </p>
          )}
        </div>
      </section>

      {home && (
        <section style={{ marginBottom: 48 }} className="prose-newsletter">
          <MDX source={home} />
        </section>
      )}

      <section>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--accent)",
            margin: "0 0 20px",
          }}
        >
          Recent letters
        </h2>

        {recent.length === 0 ? (
          <p
            style={{
              color: "var(--muted-foreground)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            The first letter is on its way.
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
                      fontFamily: "var(--font-sans)",
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {formatDate(post.date)}
                  </div>
                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: 700,
                      letterSpacing: -0.3,
                      lineHeight: 1.25,
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
              fontWeight: 600,
            }}
          >
            All letters →
          </Link>
        </div>
      </section>
    </div>
  );
}
