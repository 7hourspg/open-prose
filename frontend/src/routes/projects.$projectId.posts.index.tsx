import { createFileRoute } from "@tanstack/react-router";
import { BrandLogo, BrandWordmark } from "@/components/Brand";

export const Route = createFileRoute("/projects/$projectId/posts/")({
  component: PostsEmpty,
});

function PostsEmpty() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center"
      style={{ background: "var(--canvas)" }}
    >
      <BrandLogo size={56} style={{ borderRadius: 14 }} />
      <BrandWordmark size={18} style={{ color: "var(--ink-2)" }} />
      <div
        className="mt-1 max-w-[28ch] text-[13px] leading-[1.55]"
        style={{ color: "var(--ink-4)" }}
      >
        Pick a post on the left, or hit{" "}
        <kbd
          className="rounded px-1.5 py-0.5 text-[11px] font-semibold"
          style={{
            background: "color-mix(in oklab, var(--ink) 8%, transparent)",
            color: "var(--ink-2)",
            fontFamily: "var(--font-mono-stack)",
          }}
        >
          ⌘K
        </kbd>{" "}
        to jump anywhere.
      </div>
    </div>
  );
}
