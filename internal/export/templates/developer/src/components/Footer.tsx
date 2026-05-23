import Link from "next/link";
import { site, footer } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const copyright =
    footer.copyright || `© ${year} ${site.author || site.name}`;
  return (
    <footer
      className="flex flex-wrap items-center justify-between gap-4 px-4 py-[18px] md:px-8"
      style={{
        borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--muted-foreground)",
        background: "var(--card)",
      }}
    >
      <div>{copyright}</div>
      <nav aria-label="Social" style={{ display: "flex", gap: 14 }}>
        {(footer.social ?? []).map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
          >
            [{s.platform}]
          </a>
        ))}
        <Link
          href="/feed.xml"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          [rss]
        </Link>
      </nav>
    </footer>
  );
}
