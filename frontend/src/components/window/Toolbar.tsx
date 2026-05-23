import type { ReactNode } from "react";

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-12 flex-none items-center gap-2.5 px-3.5"
      style={{
        borderBottom: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--panel) 96%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

export function TbDivider() {
  return (
    <span
      className="inline-block h-[22px] w-px flex-none"
      style={{ background: "var(--hairline-strong)" }}
    />
  );
}

export function TbSpacer() {
  return <span className="flex-1" />;
}

type IconBtnProps = {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
};

export function IconBtn({ children, onClick, title, active, disabled, className }: IconBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      data-active={active ? "1" : "0"}
      className={
        "inline-flex h-7 min-w-7 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] border-0 bg-transparent px-1.5 text-[12.5px] font-medium transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:text-[var(--ink)] data-[active='1']:bg-[color-mix(in_oklab,var(--ink)_9%,transparent)] data-[active='1']:text-[var(--ink)] disabled:opacity-40 " +
        (className ?? "")
      }
      style={{ color: "var(--ink-2)" }}
    >
      {children}
    </button>
  );
}

type PillProps = {
  children: ReactNode;
  onClick?: () => void;
  ghost?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
};

export function Pill({ children, onClick, ghost, disabled, title, className }: PillProps) {
  if (ghost) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={
          "inline-flex h-7 items-center gap-1.5 rounded-[7px] border-0 bg-transparent px-3 text-[12.5px] font-semibold transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] hover:text-[var(--ink)] disabled:opacity-40 " +
          (className ?? "")
        }
        style={{
          color: "var(--ink-2)",
          boxShadow: "0 0 0 0.5px var(--hairline-strong) inset",
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={
        "inline-flex h-7 items-center gap-1.5 rounded-[7px] border-0 px-3 text-[12.5px] font-semibold text-white transition-[filter] hover:brightness-105 disabled:opacity-50 " +
        (className ?? "")
      }
      style={{
        background: "var(--accent)",
        boxShadow: "0 1px 2px rgba(0,0,0,.12), 0 0 0 .5px rgba(0,0,0,.1) inset",
      }}
    >
      {children}
    </button>
  );
}
