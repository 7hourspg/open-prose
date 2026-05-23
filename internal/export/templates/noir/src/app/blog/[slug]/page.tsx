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
  const author = post.author || site.author;

  return (
    <div
      className="px-5 pt-10 pb-12 md:px-8 md:pt-12"
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
          fontSize: 11,
          color: "var(--accent)",
          textDecoration: "none",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        ← Back
      </Link>

      {post.coverImage && (
        <div style={{ marginTop: 28, marginBottom: 0 }}>
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 720px"
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}

      <header style={{ marginTop: post.coverImage ? 32 : 36, marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 500,
            fontStyle: "italic",
            letterSpacing: -0.8,
            lineHeight: 1.15,
            margin: "0 0 18px",
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11.5,
            color: "var(--muted-foreground)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          <span>{formatDate(post.publishedAt)}</span>
          {author && author !== site.author && <span>by {author}</span>}
          {post.tags.length > 0 && (
            <>
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 3,
                  background: "var(--accent)",
                }}
              />
              <span>{post.tags.join(" · ")}</span>
            </>
          )}
        </div>
      </header>

      <article className="prose-noir">
        <MDX source={post.content} />
      </article>

      {(author || hasAbout) && (
        <div
          style={{
            borderTop:
              "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
            marginTop: 56,
            paddingTop: 28,
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            color: "var(--muted-foreground)",
            fontStyle: "italic",
          }}
        >
          {author ? `${author}, writing in ` : "Written for "}
          <Link
            href="/"
            style={{
              color: "var(--foreground)",
              textDecoration: "none",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {site.name}
          </Link>
          .{" "}
          {hasAbout && (
            <Link
              href="/about"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              About →
            </Link>
          )}
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
                  fontSize: 10.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  marginBottom: 4,
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                ← Earlier
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontStyle: "italic",
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
                  fontSize: 10.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  marginBottom: 4,
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                Later →
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 17,
                  fontStyle: "italic",
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
