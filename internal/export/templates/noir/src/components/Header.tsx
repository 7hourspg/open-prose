import Link from "next/link";
import { hasAbout, header, navigation, site } from "@/lib/site";
import { MobileNav } from "@/components/MobileNav";
import { Search } from "@/components/Search";

function buildNavLinks() {
  const manual = (navigation ?? []).map((n) => ({ label: n.label, href: n.href }));
  const seen = new Set(manual.map((l) => l.href));
  const auto: { label: string; href: string }[] = [];
  if (!seen.has("/blog")) auto.push({ label: "Writing", href: "/blog" });
  if (hasAbout && !seen.has("/about")) auto.push({ label: "About", href: "/about" });
  return [...manual, ...auto];
}

export function Header() {
  const links = buildNavLinks();
  return (
    <header
      className="px-5 pt-7 pb-5 md:px-12 md:pt-9 md:pb-6"
      style={{
        borderBottom: "1px solid color-mix(in oklab, var(--accent) 26%, transparent)",
        fontFamily: "var(--font-serif)",
      }}
    >
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href="/"
          className="min-w-0 flex-1"
          style={{ color: "var(--foreground)", textDecoration: "none" }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: -0.4,
            }}
          >
            {site.name}
          </span>
          {header.tagline && (
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                color: "var(--muted-foreground)",
                marginLeft: 14,
                fontStyle: "normal",
                letterSpacing: 0.3,
              }}
            >
              — {header.tagline}
            </span>
          )}
        </Link>
        <div className="hidden md:block" style={{ width: 220, flexShrink: 0 }}>
          <Search />
        </div>
        {links.length > 0 && (
          <nav
            aria-label="Primary"
            className="hidden md:flex"
            style={{
              gap: 22,
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <MobileNav links={links} brand={site.name} />
      </div>
    </header>
  );
}
