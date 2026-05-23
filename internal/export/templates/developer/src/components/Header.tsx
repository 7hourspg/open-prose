import Link from "next/link";
import { hasAbout, header, navigation, site } from "@/lib/site";
import { MobileNav } from "@/components/MobileNav";
import { Search } from "@/components/Search";

function buildNavLinks() {
  const manual = (navigation ?? []).map((n) => ({ label: n.label, href: n.href }));
  const seen = new Set(manual.map((l) => l.href));
  const auto: { label: string; href: string }[] = [];
  if (!seen.has("/blog")) auto.push({ label: "blog", href: "/blog" });
  if (hasAbout && !seen.has("/about"))
    auto.push({ label: "about", href: "/about" });
  if (!seen.has("/feed.xml"))
    auto.push({ label: "rss", href: "/feed.xml" });
  return [...manual, ...auto];
}

export function Header() {
  const links = buildNavLinks();
  return (
    <header
      className="flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-3.5"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        fontFamily: "var(--font-mono)",
      }}
    >
      <Link
        href="/"
        className="min-w-0 flex-1"
        style={{
          color: "var(--foreground)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "var(--accent)" }}>❯</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{site.name}</span>
        {header.tagline && (
          <span
            className="hidden sm:inline"
            style={{
              color: "var(--muted-foreground)",
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            — {header.tagline}
          </span>
        )}
      </Link>
      <div className="hidden md:block" style={{ width: 200, flexShrink: 0 }}>
        <Search />
      </div>
      <nav
        aria-label="Primary"
        className="hidden md:flex"
        style={{
          gap: 18,
          fontSize: 13,
          flexShrink: 0,
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
      <MobileNav links={links} brand={site.name} />
    </header>
  );
}
