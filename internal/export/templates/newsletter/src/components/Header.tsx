import Link from "next/link";
import { hasAbout, navigation, site } from "@/lib/site";
import { MobileNav } from "@/components/MobileNav";
import { Search } from "@/components/Search";

function buildNavLinks() {
  const manual = (navigation ?? []).map((n) => ({ label: n.label, href: n.href }));
  const seen = new Set(manual.map((l) => l.href));
  const auto: { label: string; href: string }[] = [];
  if (!seen.has("/blog")) auto.push({ label: "Letters", href: "/blog" });
  if (hasAbout && !seen.has("/about")) auto.push({ label: "About", href: "/about" });
  return [...manual, ...auto];
}

function authorInitial() {
  return (site.author || site.name || "?").trim().charAt(0).toUpperCase();
}

export function Header() {
  const links = buildNavLinks();
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 py-4 md:px-12 md:py-5"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--background)",
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
          gap: 12,
        }}
      >
        {site.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.icon}
            alt=""
            width={36}
            height={36}
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
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {authorInitial()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: -0.2,
              lineHeight: 1.1,
            }}
          >
            {site.name}
          </div>
          {site.author && (
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11.5,
                color: "var(--muted-foreground)",
                marginTop: 2,
                lineHeight: 1.1,
              }}
            >
              by {site.author}
            </div>
          )}
        </div>
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
            fontSize: 13,
            fontWeight: 500,
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
