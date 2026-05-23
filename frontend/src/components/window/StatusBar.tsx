import type { ReactNode } from "react";

export function StatusBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-6 flex-none items-center gap-3 px-3 text-[11px] tabular-nums"
      style={{
        borderTop: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--panel) 90%, var(--bg))",
        color: "var(--ink-4)",
      }}
    >
      {children}
    </div>
  );
}

export function SbDivider() {
  return (
    <span
      className="inline-block h-3 w-px"
      style={{ background: "var(--hairline)" }}
    />
  );
}

export function SbSpacer() {
  return <span className="flex-1" />;
}

export function SavedDot({ label = "Autosaved" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: "#2bbb6e",
          boxShadow: "0 0 0 3px color-mix(in oklab, #2bbb6e 25%, transparent)",
        }}
      />
      {label}
    </span>
  );
}
