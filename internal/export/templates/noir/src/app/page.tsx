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
      className="px-5 pt-12 pb-12 md:px-8 md:pt-16"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      {home && (
        <section style={{ marginBottom: 64 }} className="prose-noir">
          <MDX source={home} />
        </section>
      )}

      <SectionLabel>Recent writing</SectionLabel>

      {recent.length === 0 ? (
        <p
          style={{
            color: "var(--muted-foreground)",
            fontStyle: "italic",
            margin: 0,
            fontSize: 17,
          }}
        >
          The press is still warm — first piece coming soon.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {recent.map((post) => (
            <li
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 16,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 23,
                      fontWeight: 500,
                      letterSpacing: -0.4,
                      flex: 1,
                    }}
                  >
                    {post.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 11.5,
                      color: "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {formatDate(post.date)}
                  </span>
                </div>
                {post.description && (
                  <div
                    style={{
                      fontSize: 16.5,
                      color: "var(--muted-foreground)",
                      lineHeight: 1.55,
                      fontStyle: "italic",
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

      <div style={{ marginTop: 32 }}>
        <Link
          href="/blog"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11.5,
            color: "var(--accent)",
            textDecoration: "none",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
            borderBottom: "1px solid color-mix(in oklab, var(--accent) 50%, transparent)",
            paddingBottom: 2,
          }}
        >
          All writing →
        </Link>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--accent)",
          margin: 0,
        }}
      >
        {children}
      </h2>
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(to right, var(--accent), transparent 70%)",
          marginTop: 6,
        }}
      />
    </div>
  );
}
