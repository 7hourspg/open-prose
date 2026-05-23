import type { Metadata } from "next";
import { Inter_Tight, Playfair_Display, Source_Serif_4 } from "next/font/google";
import "@/styles/globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { jsonLdScript, siteGraph } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  style: ["normal", "italic"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url || "https://example.com"),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  authors: site.author ? [{ name: site.author }] : undefined,
  keywords: site.keywords && site.keywords.length > 0 ? site.keywords : undefined,
  icons: site.icon ? { icon: site.icon, apple: site.icon } : undefined,
  alternates: {
    canonical: site.url,
    types: { "application/rss+xml": "/feed.xml" },
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
    locale: site.locale || "en",
    images: site.ogImage
      ? [{ url: site.ogImage, width: 1200, height: 630 }]
      : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    site: site.twitterHandle || undefined,
    creator: site.twitterHandle || undefined,
    images: site.ogImage ? [site.ogImage] : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={site.locale || "en"}
      className={`${playfair.variable} ${sourceSerif.variable} ${interTight.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(siteGraph()) }}
        />
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
        }}
      >
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
