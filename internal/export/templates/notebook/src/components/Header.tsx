import Link from "next/link";
import { hasAbout, header, navigation, site } from "@/lib/site";
import { MobileNav } from "@/components/MobileNav";
import { Search } from "@/components/Search";

function buildNavLinks() {
  const manual = (navigation ?? []).map((n) => ({ label: n.label, href: n.href }));
  const seen = new Set(manual.map((l) => l.href));
  const auto: { label: string; href: string }[] = [];
  if (!seen.has("/blog")) auto.push({ label: "Blog", href: "/blog" });
  if (hasAbout && !seen.has("/about")) auto.push({ label: "About", href: "/about" });
  return [...manual, ...auto];
}

export function Header() {
  const links = buildNavLinks();
  return (
    <header
      className="flex items-baseline justify-between gap-4 px-5 py-5 md:px-12 md:pt-8 md:pb-7"
      style={{
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-serif)",
      }}
    >
      <Link
        href="/"
        className="min-w-0 flex-1"
        style={{ color: "var(--foreground)", textDecoration: "none" }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 500,
            fontStyle: "italic",
            letterSpacing: -0.3,
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
              letterSpacing: 0.2,
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
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
      <MobileNav links={links} brand={site.name} />
    </header>
  );
}
