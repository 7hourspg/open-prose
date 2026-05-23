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

export default function AboutPage() {
  const mdx = getAboutMDX();
  if (!mdx) notFound();
  return (
    <div
      className="px-5 pt-12 pb-10 md:px-8 md:pt-16"
      style={{
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "var(--font-serif)",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(profileGraph()) }}
      />
      <article className="prose-notebook">
        <MDX source={mdx} />
      </article>
    </div>
  );
}
