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
import { hasAbout, site } from "@/lib/site";
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

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return <PostView post={post} />;
}

function PostView({ post }: { post: Post }) {
  const { prev, next } = getAdjacentPosts(post.slug);
  const isoDate = new Date(post.publishedAt).toISOString().slice(0, 10);
  const author = post.author || site.author;

  return (
    <main
      className="px-5 pt-8 pb-16 md:px-8"
      style={{
        maxWidth: 760,
        margin: "0 auto",
        fontFamily: "var(--font-sans)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleGraph(post)) }}
      />
      <Link
        href="/blog"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--muted-foreground)",
          textDecoration: "none",
        }}
      >
        ← cd ../
      </Link>

      <header
        style={{
          marginTop: 24,
          paddingBottom: 24,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--muted-foreground)",
            marginBottom: 10,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span>{isoDate}</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <span>{post.tags.map((t) => `#${t}`).join(" ")}</span>
            </>
          )}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: -0.6,
            lineHeight: 1.18,
            margin: 0,
            color: "var(--foreground)",
          }}
        >
          {post.title}
        </h1>
      </header>

      {post.coverImage && (
        <div
          style={{
            marginTop: 24,
            border: "1px solid var(--border)",
            borderRadius: 4,
            overflow: "hidden",
            background: "var(--card)",
          }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 760px"
            priority
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              aspectRatio: "16 / 9",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      <article className="prose-developer" style={{ marginTop: 28 }}>
        <MDX source={post.content} />
      </article>

      {(author || hasAbout) && (
        <footer
          style={{
            marginTop: 40,
            padding: "18px 14px",
            borderRadius: 6,
            background: "var(--card)",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--muted-foreground)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span>// {author || "the author"}</span>
          {hasAbout && (
            <Link
              href="/about"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              about →
            </Link>
          )}
        </footer>
      )}

      {(prev || next) && (
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
            gap: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
