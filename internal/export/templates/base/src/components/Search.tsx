"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";

type PagefindResult = {
  url: string;
  excerpt: string;
  meta: {
    title: string;
    description?: string;
    image?: string;
    parent_title?: string;
    parent_url?: string;
  };
};

type GroupedResult = {
  url: string;
  title: string;
  excerpt: string;
  subResults: Array<{ url: string; title: string; excerpt: string }>;
};

function groupResults(results: PagefindResult[]): GroupedResult[] {
  const groups = new Map<string, GroupedResult>();
  for (const r of results) {
    const hashIdx = r.url.indexOf("#");
    const isSection = hashIdx !== -1;
    const baseUrl = isSection ? r.url.slice(0, hashIdx) : r.url;
    const existing = groups.get(baseUrl);
    if (isSection) {
      const child = { url: r.url, title: r.meta.title, excerpt: r.excerpt };
      if (existing) {
        existing.subResults.push(child);
      } else {
        // Synthesize a parent from the section's parent_* meta — a real
        // parent record may still arrive later in the result stream and
        // upgrade this entry's title/excerpt.
        groups.set(baseUrl, {
          url: baseUrl,
          title: r.meta.parent_title ?? baseUrl,
          excerpt: "",
          subResults: [child],
        });
      }
    } else if (existing) {
      existing.url = r.url;
      existing.title = r.meta.title;
      existing.excerpt = r.excerpt;
    } else {
      groups.set(baseUrl, {
        url: r.url,
        title: r.meta.title,
        excerpt: r.excerpt,
        subResults: [],
      });
    }
  }
  return [...groups.values()];
}
type PagefindModule = {
  search: (q: string) => Promise<{ results: Array<{ data: () => Promise<PagefindResult> }> }>;
  preload: (q: string) => void;
  init?: () => void;
};

// Bypass bundler static analysis so /pagefind/pagefind.js loads from the
// deployed site at runtime rather than getting bundled.
const runtimeImport = new Function("p", "return import(p)") as (p: string) => Promise<unknown>;

export function Search() {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const pf = useRef<PagefindModule | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMac(/Mac|iP(hone|ad|od)/.test(navigator.userAgent));
    let cancelled = false;
    fetch("/pagefind/pagefind.js", { method: "HEAD" })
      .then((r) => { if (!cancelled) setAvailable(r.ok); })
      .catch(() => { if (!cancelled) setAvailable(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function ensureLoaded() {
    if (pf.current) return pf.current;
    const mod = (await runtimeImport("/pagefind/pagefind.js")) as PagefindModule;
    pf.current = mod;
    mod.init?.();
    return mod;
  }

  // Warm up the Pagefind module the moment the dialog opens.
  useEffect(() => { if (open) void ensureLoaded(); }, [open]);

  async function runSearch(q: string) {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    try {
      const mod = await ensureLoaded();
      const search = await mod.search(q);
      const data = await Promise.all(search.results.slice(0, 12).map((r) => r.data()));
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onValueChange(v: string) {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    if (!v.trim()) {
      // Clear synchronously when the input is emptied so we never render
      // both the empty state and stale results at the same time.
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (pf.current) pf.current.preload(v);
    debounce.current = setTimeout(() => runSearch(v), 150);
  }

  function go(url: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(url);
  }

  if (available !== true) return null;

  const kbdStyle = { fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)" };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-left text-[13px] text-[var(--muted-foreground)] transition-colors hover:border-[color-mix(in_srgb,var(--foreground)_30%,transparent)]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="flex-1 truncate">Search…</span>
        <kbd
          className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] sm:inline-flex"
          style={kbdStyle}
        >
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed left-1/2 top-[12vh] z-[90] w-[92vw] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl outline-none"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <Dialog.Title className="sr-only">Search posts</Dialog.Title>
            <Dialog.Description className="sr-only">Type to search; arrow keys to navigate; enter to open; escape to close.</Dialog.Description>

            <Command shouldFilter={false} className="flex flex-col" loop>
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-3">
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
                  className="shrink-0 text-[var(--muted-foreground)]"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <Command.Input
                  value={query}
                  onValueChange={onValueChange}
                  placeholder="Type to search posts…"
                  autoFocus
                  className="flex-1 bg-transparent py-3 text-[14px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                  style={{ fontFamily: "inherit" }}
                />
                <Dialog.Close
                  aria-label="Close"
                  className="cursor-pointer text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </Dialog.Close>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                {!query.trim() && (
                  <div className="px-3 py-10 text-center text-[13px] text-[var(--muted-foreground)]">
                    Type to search posts.
                  </div>
                )}
                {query.trim() && loading && results.length === 0 && (
                  <div className="px-3 py-10 text-center text-[13px] text-[var(--muted-foreground)]">
                    Searching…
                  </div>
                )}
                {query.trim() && !loading && results.length === 0 && (
                  <Command.Empty className="px-3 py-10 text-center text-[13px] text-[var(--muted-foreground)]">
                    No results.
                  </Command.Empty>
                )}
                {results.length > 0 && (() => {
                  const grouped = groupResults(results);
                  const pages = grouped.filter((g) => !g.url.startsWith("/blog/"));
                  const posts = grouped.filter((g) => g.url.startsWith("/blog/"));
                  const groupHeadingClasses =
                    "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[var(--muted-foreground)]";
                  const renderGroup = (g: GroupedResult) => (
                    <Fragment key={g.url}>
                      <Command.Item
                        value={g.url}
                        onSelect={() => go(g.url)}
                        className="flex cursor-pointer flex-col gap-1 rounded px-3 py-2.5 data-[selected=true]:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                      >
                        <div className="text-[14px] font-semibold text-[var(--foreground)]">{g.title}</div>
                        {g.excerpt && (
                          <div
                            className="line-clamp-2 text-[12.5px] leading-snug text-[var(--muted-foreground)] [&_mark]:bg-[color-mix(in_srgb,var(--accent,#fde68a)_45%,transparent)] [&_mark]:text-[var(--foreground)] [&_mark]:rounded-[2px] [&_mark]:px-0.5"
                            dangerouslySetInnerHTML={{ __html: g.excerpt }}
                          />
                        )}
                      </Command.Item>
                      {g.subResults.length > 0 && (
                        <div className="ml-4 my-0.5 border-l border-[var(--border)] pl-2">
                          {g.subResults.map((s) => (
                            <Command.Item
                              key={s.url}
                              value={s.url}
                              onSelect={() => go(s.url)}
                              className="flex cursor-pointer flex-col gap-0.5 rounded px-3 py-2 data-[selected=true]:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
                            >
                              <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--foreground)]">
                                <span className="text-[var(--muted-foreground)]">↳</span>
                                <span>{s.title}</span>
                              </div>
                              <div
                                className="line-clamp-1 pl-4 text-[11.5px] leading-snug text-[var(--muted-foreground)] [&_mark]:bg-[color-mix(in_srgb,var(--accent,#fde68a)_45%,transparent)] [&_mark]:text-[var(--foreground)] [&_mark]:rounded-[2px] [&_mark]:px-0.5"
                                dangerouslySetInnerHTML={{ __html: s.excerpt }}
                              />
                            </Command.Item>
                          ))}
                        </div>
                      )}
                    </Fragment>
                  );
                  return (
                    <>
                      {pages.length > 0 && (
                        <Command.Group heading="Pages" className={groupHeadingClasses}>
                          {pages.map(renderGroup)}
                        </Command.Group>
                      )}
                      {posts.length > 0 && (
                        <Command.Group heading="Posts" className={groupHeadingClasses}>
                          {posts.map(renderGroup)}
                        </Command.Group>
                      )}
                    </>
                  );
                })()}
              </Command.List>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3%,transparent)] px-3 py-2 text-[11px] text-[var(--muted-foreground)]">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[var(--border)] px-1 py-0.5" style={kbdStyle}>↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[var(--border)] px-1 py-0.5" style={kbdStyle}>↵</kbd>
                    open
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-[var(--border)] px-1 py-0.5" style={kbdStyle}>esc</kbd>
                  close
                </span>
              </div>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
