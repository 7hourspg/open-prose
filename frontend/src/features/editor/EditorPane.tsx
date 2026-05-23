import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

type Props = {
  crumbTrail: ReactNode;
  status?: ReactNode;
  rightAction?: ReactNode;
  children: ReactNode;
};

export function EditorPane({
  crumbTrail,
  status,
  rightAction,
  children,
}: Props) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ background: "var(--canvas)" }}>
      <div
        className="flex h-11 flex-none items-center gap-1.5 overflow-hidden pl-4 pr-3"
        style={{
          borderBottom: "0.5px solid var(--hairline)",
          background: "color-mix(in oklab, var(--canvas) 92%, var(--panel))",
        }}
      >
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[12px]"
          style={{ color: "var(--ink-3)" }}
        >
          {crumbTrail}
        </div>
        {status && (
          <div
            className="ml-2.5 inline-flex flex-none items-center gap-1.5 whitespace-nowrap text-[11px]"
            style={{ color: "var(--ink-4)" }}
          >
            {status}
          </div>
        )}
        {rightAction}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

export function CrumbCurrent({ children }: { children: ReactNode }) {
  return (
    <b
      className="min-w-0 flex-shrink truncate font-semibold"
      style={{ color: "var(--ink)" }}
    >
      {children}
    </b>
  );
}

export function CrumbSep() {
  return (
    <span className="flex-none" style={{ color: "var(--ink-4)" }}>
      <Icon name="chevron" size={12} />
    </span>
  );
}

export function SavedStatus({ savedAt }: { savedAt?: string | Date | null }) {
  return (
    <>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: "#2bbb6e",
          boxShadow: "0 0 0 3px color-mix(in oklab, #2bbb6e 25%, transparent)",
        }}
      />
      <span className="max-[1100px]:hidden">
        Saved {savedAt ? `· ${formatRel(savedAt)}` : ""}
      </span>
    </>
  );
}

export function WordCount({ markdown }: { markdown: string }) {
  const words = countMarkdownWords(markdown);
  const minutes = Math.max(1, Math.round(words / 220));
  return (
    <span
      className="ml-3 inline-flex flex-none items-center gap-1 whitespace-nowrap text-[11px] tabular-nums"
      style={{ color: "var(--ink-4)" }}
      title={`${words} words · ~${minutes} min read`}
    >
      {words.toLocaleString()} words · {minutes} min
    </span>
  );
}

function countMarkdownWords(md: string): number {
  if (!md) return 0;
  const stripped = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ");
  const matches = stripped.match(/\S+/g);
  return matches ? matches.length : 0;
}

function formatRel(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString();
}
