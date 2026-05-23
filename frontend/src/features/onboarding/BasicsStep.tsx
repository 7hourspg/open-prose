import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  author: string;
  url: string;
  busy?: boolean;
  onPatch: (patch: { name?: string; author?: string; url?: string }) => void;
  onContinue: () => void;
  onBack: () => void;
};

function urlError(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return "Use http:// or https://";
    }
    return null;
  } catch {
    return "That doesn't look like a URL — try https://example.com";
  }
}

export function BasicsStep({
  name,
  author,
  url,
  busy,
  onPatch,
  onContinue,
  onBack,
}: Props) {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  const err = touched ? urlError(url) : null;

  function submit() {
    setTouched(true);
    onContinue();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="welcome-step mx-auto flex max-w-[520px] flex-col px-8 py-12"
      style={{ color: "var(--ink)" }}
    >
      <div
        className="text-[11px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--ink-4)", fontFamily: "var(--font-ui)" }}
      >
        Step 2 of 2
      </div>
      <h2
        className="mt-2 text-[24px] font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-serif-stack)" }}
      >
        Site basics
      </h2>
      <p
        className="mt-1 text-[14px] leading-[1.55]"
        style={{ color: "var(--ink-2)", fontFamily: "var(--font-serif-stack)" }}
      >
        All optional — set them later if you'd rather.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <Field label="Site name">
          <input
            ref={nameRef}
            value={name || ""}
            onChange={(e) => onPatch({ name: e.target.value })}
            placeholder="My blog"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[34px] w-full rounded-[7px] px-2.5 text-[13.5px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
        </Field>

        <Field label="Author">
          <input
            value={author}
            onChange={(e) => onPatch({ author: e.target.value })}
            placeholder="Your name"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[34px] w-full rounded-[7px] px-2.5 text-[13.5px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
        </Field>

        <Field
          label="URL"
          helper="You can set this later when you deploy."
          error={err ?? undefined}
        >
          <input
            value={url}
            onChange={(e) => onPatch({ url: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder="https://example.com"
            inputMode="url"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[34px] w-full rounded-[7px] px-2.5 text-[13.5px] outline-none"
            style={{
              border: `0.5px solid ${err ? "var(--accent)" : "var(--hairline-strong)"}`,
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
        </Field>
      </div>

      <div className="mt-9 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
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
          onClick={submit}
          disabled={busy}
          className="rounded-[7px] px-5 py-2.5 text-[13px] font-medium"
          style={{
            background: "var(--accent)",
            color: "white",
            border: "0.5px solid var(--accent)",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Creating…" : "Continue → write your first post"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div
        className="mb-1.5 text-[12px] font-medium"
        style={{ color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}
      >
        {label}
      </div>
      {children}
      {error ? (
        <div
          className="mt-1 text-[11.5px]"
          style={{ color: "var(--accent)", fontFamily: "var(--font-ui)" }}
        >
          {error}
        </div>
      ) : helper ? (
        <div
          className="mt-1 text-[11.5px]"
          style={{ color: "var(--ink-4)", fontFamily: "var(--font-ui)" }}
        >
          {helper}
        </div>
      ) : null}
    </label>
  );
}
