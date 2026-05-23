import Link from "next/link";
import { site, footer } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const copyright =
    footer.copyright || `© ${year} ${site.author || site.name}`;
  return (
    <footer
      className="px-5 py-7 md:px-16 md:py-7"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.2,
              marginBottom: 6,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11.5,
              color: "var(--muted-foreground)",
              letterSpacing: "0.04em",
            }}
          >
            {copyright}
          </div>
        </div>
        <nav
          aria-label="Social"
          style={{
            display: "flex",
            gap: 24,
            fontFamily: "var(--font-sans)",
            fontSize: 11.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {(footer.social ?? []).map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--foreground)", textDecoration: "none" }}
            >
              {s.platform}
            </a>
          ))}
          <Link
            href="/feed.xml"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            RSS ↗
          </Link>
        </nav>
      </div>
    </footer>
  );
}
