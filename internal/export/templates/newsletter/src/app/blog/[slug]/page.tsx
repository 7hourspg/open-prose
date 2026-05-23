import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDX } from "@/lib/mdx";
import {
  getAdjacentPosts,
  getAllPostSlugs,
  getPost,
  type Post,
} from "@/lib/content";
import { site, hasAbout } from "@/lib/site";
import { absUrl, articleGraph, jsonLdScript } from "@/lib/seo";

type Params = { slug: string };

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = `${site.url}/blog/${post.slug}`;
  const canonical = post.canonical || url;
  const author = post.author || site.author;
  const ogImage = post.coverImage || site.ogImage;
  const ogImages = ogImage
    ? [{ url: absUrl(ogImage), width: 1200, height: 630 }]
    : undefined;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical },
    robots: post.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: site.name,
      locale: site.locale || "en",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: author ? [author] : undefined,
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      site: site.twitterHandle || undefined,
      creator: site.twitterHandle || undefined,
      images: ogImage ? [absUrl(ogImage)] : undefined,
    },
  };
}

function authorInitial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function readingMinutes(text: string): number {
  const words = (text.match(/\S+/g) || []).length;
  return Math.max(1, Math.round(words / 220));
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <PostView post={post} />;
}

function PostView({ post }: { post: Post }) {
  const { prev, next } = getAdjacentPosts(post.slug);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const author = post.author || site.author || site.name;
  const minutes = readingMinutes(post.content);

  return (
    <div
      className="px-5 pt-8 pb-12 md:px-8 md:pt-12"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleGraph(post)) }}
      />

      <Link
        href="/blog"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--muted-foreground)",
          textDecoration: "none",
        }}
      >
        ← All letters
      </Link>

      <header style={{ marginTop: 28, marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 14,
          }}
        >
          {formatDate(post.publishedAt)}
        </div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: -0.7,
            lineHeight: 1.12,
            margin: "0 0 14px",
          }}
        >
          {post.title}
        </h1>
        {post.description && (
          <p
            style={{
              fontSize: 18.5,
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
              margin: "0 0 20px",
              fontStyle: "italic",
            }}
          >
            {post.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          {site.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.icon}
              alt={author}
              width={36}
              height={36}
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
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "var(--accent-foreground)",
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {authorInitial(author)}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--foreground)",
                lineHeight: 1.2,
              }}
            >
              {author}
            </div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11.5,
                color: "var(--muted-foreground)",
                marginTop: 2,
              }}
            >
              {minutes} min read
              {post.tags.length > 0 && (
                <>
                  <span style={{ margin: "0 6px", opacity: 0.6 }}>·</span>
                  {post.tags.slice(0, 3).join(" · ")}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div style={{ marginBottom: 32 }}>
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 720px"
            priority
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 4 }}
          />
        </div>
      )}

      <article className="prose-newsletter">
        <MDX source={post.content} />
      </article>

      {hasAbout && (
        <div
          style={{
            marginTop: 56,
            padding: 24,
            background: "color-mix(in oklab, var(--accent) 6%, var(--background))",
            border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
            borderRadius: 6,
          }}
        >
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
            About the writer
          </div>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 15.5,
              color: "var(--foreground)",
              lineHeight: 1.55,
            }}
          >
            {site.description ||
              `${author} writes ${site.name}. Read more about the work behind these letters.`}
          </p>
          <Link
            href="/about"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            About →
          </Link>
        </div>
      )}

      {(prev || next) && (
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 40,
            gap: 24,
            fontFamily: "var(--font-sans)",
          }}
        >
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              style={{
                color: "var(--muted-foreground)",
                textDecoration: "none",
                fontSize: 13,
                maxWidth: "45%",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                ← Earlier letter
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              style={{
                color: "var(--muted-foreground)",
                textDecoration: "none",
                fontSize: 13,
                textAlign: "right",
                maxWidth: "45%",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Newer letter →
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                {next.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
