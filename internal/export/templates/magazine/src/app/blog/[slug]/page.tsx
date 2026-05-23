import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDX } from "@/lib/mdx";
import {
  getAllPostSlugs,
  getPost,
  type Post,
} from "@/lib/content";
import { site } from "@/lib/site";
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
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const author = post.author || site.author;

  return (
    <main
      className="px-5 pt-10 pb-16 md:px-8 md:pt-12"
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
          fontSize: 11.5,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
          textDecoration: "none",
        }}
      >
        ← Back to blog
      </Link>

      {post.coverImage && (
        <figure style={{ marginTop: 28, marginBottom: 0 }}>
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1600}
            height={900}
            sizes="(max-width: 768px) 100vw, 720px"
            priority
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </figure>
      )}

      <header
        style={{
          marginTop: post.coverImage ? 24 : 32,
          marginBottom: 36,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 8vw, 44px)",
            fontWeight: 700,
            letterSpacing: -0.6,
            lineHeight: 1.08,
            margin: "0 0 16px",
          }}
        >
          {post.title}
        </h1>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            color: "var(--muted-foreground)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            letterSpacing: "0.04em",
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
                  background: "var(--muted-foreground)",
                }}
              />
              <span>{post.tags.join(" · ")}</span>
            </>
          )}
        </div>
      </header>

      <article className="prose-magazine">
        <MDX source={post.content} />
      </article>
    </main>
  );
}
