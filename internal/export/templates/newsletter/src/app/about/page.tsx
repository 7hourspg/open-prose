import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDX } from "@/lib/mdx";
import { getAboutMDX } from "@/lib/content";
import { site } from "@/lib/site";
import { jsonLdScript, profileGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}`,
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    type: "profile",
    title: "About",
    description: `About ${site.name}`,
    url: `${site.url}/about`,
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description: `About ${site.name}`,
    site: site.twitterHandle || undefined,
    creator: site.twitterHandle || undefined,
    images: site.ogImage ? [site.ogImage] : undefined,
  },
};

function authorInitial() {
  return (site.author || site.name || "?").trim().charAt(0).toUpperCase();
}

export default function AboutPage() {
  const mdx = getAboutMDX();
  if (!mdx) notFound();
  return (
    <div
      className="px-5 pt-10 pb-12 md:px-8 md:pt-14"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(profileGraph()) }}
      />
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 36,
          paddingBottom: 28,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {site.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.icon}
            alt={site.author || site.name}
            width={72}
            height={72}
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
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {authorInitial()}
          </div>
        )}
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: -0.5,
              margin: "0 0 4px",
              lineHeight: 1.15,
            }}
          >
            {site.author || site.name}
          </h1>
          {site.description && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {site.description}
            </p>
          )}
        </div>
      </header>
      <article className="prose-newsletter">
        <MDX source={mdx} />
      </article>
    </div>
  );
}
