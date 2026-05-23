import { useEffect, useState } from "react";

const DISMISS_KEY = "openprose.firstRunBannerDismissed";
const JUST_ONBOARDED_KEY = "openprose.justOnboarded";

type Props = {
  onExport: () => void;
  onHelp: () => void;
};

export function SessionBanner({ onExport, onHelp }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.localStorage.getItem(JUST_ONBOARDED_KEY) === "1") {
      setVisible(true);
      window.localStorage.removeItem(JUST_ONBOARDED_KEY);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2"
      style={{
        background: "var(--canvas)",
        borderBottom: "0.5px solid var(--hairline)",
        fontFamily: "var(--font-ui)",
        fontSize: 12.5,
        color: "var(--ink-3)",
      }}
    >
      <span style={{ color: "var(--ink-2)" }}>When you're ready:</span>
      <button
        type="button"
        onClick={onExport}
        className="border-0 bg-transparent p-0 text-[12.5px] font-medium"
        style={{ color: "var(--accent)" }}
      >
        Export
      </button>
      <span style={{ color: "var(--ink-4)" }}>·</span>
      <button
        type="button"
        onClick={onExport}
        className="border-0 bg-transparent p-0 text-[12.5px] font-medium"
        style={{ color: "var(--accent)" }}
      >
        Deploy
      </button>
      <span style={{ color: "var(--ink-4)" }}>·</span>
      <button
        type="button"
        onClick={onHelp}
        className="border-0 bg-transparent p-0 text-[12.5px] font-medium"
        style={{ color: "var(--accent)" }}
      >
        Help
      </button>
      <div className="ml-auto">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="inline-flex h-6 w-6 items-center justify-center rounded-[5px] border-0 bg-transparent"
          style={{ color: "var(--ink-3)" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
