"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search } from "@/components/Search";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  brand,
}: {
  links: NavLink[];
  brand?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const pathname = usePathname();

  // Close the drawer on route change — covers the case where the search
  // dialog (rendered inside the drawer) navigates via router.push and would
  // otherwise leave the drawer visually open on the destination page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls={titleId}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          color: "var(--foreground)",
          background: "transparent",
          border: "1px solid var(--border)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div
          className="md:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
          }}
        >
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "color-mix(in oklab, var(--foreground) 40%, transparent)",
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            ref={drawerRef}
            id={titleId}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(320px, 86vw)",
              background: "var(--background)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-12px 0 32px color-mix(in oklab, var(--foreground) 12%, transparent)",
              display: "flex",
              flexDirection: "column",
              fontFamily: "var(--font-sans)",
              color: "var(--foreground)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                {brand || "Menu"}
              </span>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  color: "var(--foreground)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div
              style={{
                padding: "16px 16px 12px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Search />
            </div>

            <nav
              aria-label="Primary"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 8px 24px",
                gap: 2,
                overflowY: "auto",
              }}
            >
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "14px 14px",
                    borderRadius: 6,
                    color: "var(--foreground)",
                    textDecoration: "none",
                    fontSize: 16,
                    lineHeight: 1.3,
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
