import { useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";
import {
  TEMPLATE_THUMB_ASPECT,
  TemplateThumb,
} from "@/components/TemplateThumb";

const TEMPLATES: { id: string; name: string; description: string }[] = [
  { id: "minimal", name: "Minimal", description: "A serif-led, single-column blog. For essays." },
  { id: "magazine", name: "Magazine", description: "An editorial layout with a large display face. For longer features." },
  { id: "developer", name: "Developer", description: "A monospace, terminal-flavoured layout. For technical posts." },
];

type Props = {
  selected: string;
  draftName: string;
  onSelect: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function TemplateStep({
  selected,
  draftName,
  onSelect,
  onContinue,
  onBack,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tile = containerRef.current?.querySelector<HTMLButtonElement>(
      `button[data-template="${selected}"]`
    );
    tile?.focus();
  }, [selected]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = TEMPLATES.findIndex((t) => t.id === selected);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSelect(TEMPLATES[(idx + 1) % TEMPLATES.length].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSelect(TEMPLATES[(idx - 1 + TEMPLATES.length) % TEMPLATES.length].id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onContinue();
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className="welcome-step mx-auto flex max-w-[920px] flex-col px-8 py-12"
      style={{ color: "var(--ink)" }}
    >
      <div
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--ink-4)", fontFamily: "var(--font-ui)" }}
      >
        Step 1 of 2
      </div>
      <h2
        className="mt-2 text-[24px] font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-serif-stack)" }}
      >
        Pick a template
      </h2>
      <p
        className="mt-1 text-[14px] leading-[1.55]"
        style={{ color: "var(--ink-2)", fontFamily: "var(--font-serif-stack)" }}
      >
        Three visual registers. Use the arrow keys to compare, Enter to
        continue.
      </p>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        {TEMPLATES.map((t) => {
          const on = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              data-template={t.id}
              onClick={() => onSelect(t.id)}
              onDoubleClick={onContinue}
              className="flex flex-col gap-3 rounded-[10px] p-3 text-left"
              style={{
                border: `0.5px solid ${on ? "var(--accent)" : "var(--hairline-strong)"}`,
                background: "var(--canvas)",
                boxShadow: on
                  ? "0 0 0 3px color-mix(in oklab, var(--accent) 16%, transparent)"
                  : undefined,
              }}
            >
              <div
                className="overflow-hidden rounded-[7px]"
                style={{
                  aspectRatio: TEMPLATE_THUMB_ASPECT,
                  border: "0.5px solid var(--hairline)",
                }}
              >
                <TemplateThumb template={t.id} name={draftName || "My blog"} />
              </div>
              <div>
                <div
                  className="flex items-center gap-1.5 text-[13px] font-semibold"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-ui)" }}
                >
                  {t.name}
                  {on && (
                    <span
                      className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full text-white"
                      style={{ background: "var(--accent)", fontSize: 9 }}
                    >
                      <Icon name="check" size={8} />
                    </span>
                  )}
                </div>
                <div
                  className="mt-0.5 text-[12.5px]"
                  style={{ color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}
                >
                  {t.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="mt-3 text-[12px]"
        style={{ color: "var(--ink-4)", fontFamily: "var(--font-ui)" }}
      >
        Change later — every template uses the same content.
      </div>

      <div className="mt-9 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium"
          style={{
            color: "var(--ink-3)",
            background: "transparent",
            border: 0,
            padding: "10px 4px",
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-[7px] px-5 py-2.5 text-[13px] font-medium"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "0.5px solid var(--accent)",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
