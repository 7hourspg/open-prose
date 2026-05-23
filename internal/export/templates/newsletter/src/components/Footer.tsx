import Link from "next/link";
import { site, footer } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const copyright = footer.copyright || `© ${year} ${site.author || site.name}`;
  return (
    <footer
      className="flex flex-col gap-3 px-5 py-7 md:flex-row md:items-center md:justify-between md:gap-6 md:px-12"
      style={{
        borderTop: "1px solid var(--border)",
        fontFamily: "var(--font-sans)",
        fontSize: 12.5,
        color: "var(--muted-foreground)",
      }}
    >
      <div>{copyright}</div>
      <nav
        aria-label="Social"
        className="flex flex-wrap gap-x-4 gap-y-2 md:[gap:18px]"
      >
        {(footer.social ?? []).map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
          >
            {s.platform}
          </a>
        ))}
        <Link
          href="/feed.xml"
          style={{ color: "var(--muted-foreground)", textDecoration: "none" }}
        >
          RSS →
        </Link>
      </nav>
    </footer>
  );
}
