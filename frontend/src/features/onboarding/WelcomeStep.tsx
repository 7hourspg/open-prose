import { useEffect, useRef, useState } from "react";
import { BrandLogo, BrandWordmark } from "@/components/Brand";

type Props = {
  onContinue: () => void;
  onSkip: () => void;
};

export function WelcomeStep({ onContinue, onSkip }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  return (
    <div
      className="welcome-step mx-auto flex max-w-[520px] flex-col items-center px-8 py-16 text-center"
      style={{ color: "var(--ink)" }}
    >
      <BrandLogo size={72} style={{ borderRadius: 16 }} />
      <h1
        className="mt-7 text-[28px] font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-serif-stack)", color: "var(--ink)" }}
      >
        <BrandWordmark size={28} />
      </h1>
      <p
        className="mt-5 text-[15px] leading-[1.55]"
        style={{ color: "var(--ink-2)", fontFamily: "var(--font-serif-stack)" }}
      >
        A small native app for writing things and shipping them as your own
        static site. No cloud, no accounts — your posts live in a file on your
        computer, and one click turns them into a real website.
      </p>

      <div className="mt-9 flex items-center gap-3">
        <button
          ref={primaryRef}
          type="button"
          onClick={onContinue}
          className="rounded-[7px] px-5 py-2.5 text-[13px] font-medium"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "0.5px solid var(--accent)",
          }}
        >
          Take the tour
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-medium"
          style={{
            color: "var(--ink-3)",
            background: "transparent",
            border: 0,
            padding: "10px 4px",
          }}
        >
          Skip — I know what I'm doing
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="mt-12 text-[12px]"
        style={{
          color: "var(--ink-3)",
          background: "transparent",
          border: 0,
          padding: 0,
          fontFamily: "var(--font-ui)",
        }}
      >
        Show me what gets exported {showDetail ? "↑" : "↓"}
      </button>

      {showDetail && (
        <div
          className="mt-4 w-full rounded-[8px] px-5 py-4 text-left text-[12.5px] leading-[1.6]"
          style={{
            background: "var(--canvas)",
            border: "0.5px solid var(--hairline-strong)",
            color: "var(--ink-2)",
            fontFamily: "var(--font-ui)",
          }}
        >
          <p style={{ margin: 0 }}>
            When you click Export, Open Prose writes a real Next.js 16 project
            to a folder you choose:
          </p>
          <ul
            className="mt-2"
            style={{ paddingLeft: 18, margin: 0, listStyle: "disc" }}
          >
            <li>Your posts as <code style={{ fontFamily: "var(--font-mono-stack)" }}>.mdx</code> files under <code style={{ fontFamily: "var(--font-mono-stack)" }}>content/posts/</code></li>
            <li>Site config, navigation, and theme tokens in <code style={{ fontFamily: "var(--font-mono-stack)" }}>src/lib/site.ts</code></li>
            <li>Sitemap, <code style={{ fontFamily: "var(--font-mono-stack)" }}>robots.txt</code>, RSS feed, JSON-LD structured data — all wired</li>
            <li>Tailwind, MDX, image optimization, fonts — all preconfigured</li>
          </ul>
          <p className="mt-2" style={{ margin: 0, color: "var(--ink-3)" }}>
            Open it in your editor of choice. Nothing is hidden.
          </p>
        </div>
      )}
    </div>
  );
}
