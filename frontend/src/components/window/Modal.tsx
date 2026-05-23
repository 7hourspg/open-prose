import type { ReactNode } from "react";
import { useEffect } from "react";
import { Icon } from "@/components/Icon";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
};

export function Modal({ open, onClose, title, icon, footer, children, maxWidth = 540 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center p-10"
      style={{
        background: "rgba(20,15,8,.32)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-h-[85vh] flex-col overflow-hidden"
        style={{
          maxWidth,
          background: "var(--panel)",
          borderRadius: 14,
          border: "0.5px solid var(--hairline-strong)",
          boxShadow: "0 30px 80px rgba(0,0,0,.3)",
        }}
      >
        {(title || icon) && (
          <div
            className="flex items-center gap-2.5 px-4 pb-3 pt-4"
            style={{ borderBottom: "0.5px solid var(--hairline)" }}
          >
            {icon}
            <h3
              className="m-0 text-[18px] font-semibold"
              style={{ fontFamily: "var(--font-serif-stack)", color: "var(--ink)" }}
            >
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border-0 bg-transparent transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] hover:text-[var(--ink)]"
              style={{ color: "var(--ink-3)" }}
            >
              <Icon name="x" size={12} />
            </button>
          </div>
        )}
        <div className="thin-scrollbar overflow-y-auto py-3">{children}</div>
        {footer && (
          <div
            className="flex justify-end gap-2 px-4 py-3"
            style={{
              borderTop: "0.5px solid var(--hairline)",
              background: "color-mix(in oklab, var(--panel) 96%, var(--bg))",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
