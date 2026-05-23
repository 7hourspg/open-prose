import Link from "next/link";
import { hasAbout, navigation, site } from "@/lib/site";
import { MobileNav } from "@/components/MobileNav";
import { Search } from "@/components/Search";

function buildNavLinks() {
  const manual = (navigation ?? []).map((n) => ({ label: n.label, href: n.href }));
  const seen = new Set(manual.map((l) => l.href));
  const auto: { label: string; href: string }[] = [];
  if (!seen.has("/blog")) auto.push({ label: "Blog", href: "/blog" });
  if (hasAbout && !seen.has("/about"))
    auto.push({ label: "About", href: "/about" });
  return [...manual, ...auto];
}

export function Header() {
  const links = buildNavLinks();
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-4 md:items-baseline md:px-16 md:py-5"
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link
        href="/"
        className="min-w-0 flex-1"
        style={{
          color: "var(--foreground)",
          textDecoration: "none",
          display: "flex",
          alignItems: "baseline",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 5.5vw, 26px)",
            fontWeight: 700,
            letterSpacing: -0.3,
          }}
        >
          {site.name}
        </span>
      </Link>
      <div className="hidden md:block" style={{ width: 220, flexShrink: 0 }}>
        <Search />
      </div>
      {links.length > 0 && (
        <nav
          aria-label="Primary"
          className="hidden md:flex"
          style={{
            gap: 28,
            fontFamily: "var(--font-sans)",
            fontSize: 11.5,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: "var(--foreground)", textDecoration: "none" }}
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
