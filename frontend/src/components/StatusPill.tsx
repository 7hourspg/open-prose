type Tone = "ready" | "missing";

const TONES: Record<
  Tone,
  { bg: string; fg: string; dot: string }
> = {
  ready: {
    bg: "color-mix(in oklab, #2bbb6e 16%, transparent)",
    fg: "#1a8a4f",
    dot: "#2bbb6e",
  },
  missing: {
    bg: "color-mix(in oklab, #d44a3e 14%, transparent)",
    fg: "#d44a3e",
    dot: "#d44a3e",
  },
};

export function StatusPill({
  tone,
  label,
}: {
  tone: Tone;
  label: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium"
      style={{ background: t.bg, color: t.fg }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: t.dot }}
      />
      {label}
    </span>
  );
}
