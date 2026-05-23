import { useEffect, useState } from "react";
import { Modal } from "@/components/window/Modal";
import { Pill } from "@/components/window/Toolbar";
import { Icon } from "@/components/Icon";
import { ImageUploader } from "@/components/ImageUploader";
import { domain } from "../../../wailsjs/go/models";

type Props = {
  open: boolean;
  onClose: () => void;
  post: domain.Post;
  siteUrl: string;
  siteAuthor?: string;
  allTags?: string[];
  onChange: (next: domain.Post) => void;
};

export function MetaModal({
  open,
  onClose,
  post,
  siteUrl,
  siteAuthor,
  allTags,
  onChange,
}: Props) {
  const [draft, setDraft] = useState(post);
  useEffect(() => {
    if (open) setDraft(post);
  }, [open, post]);

  const slugError =
    draft.slug === "about" ? "The slug 'about' is reserved." : null;

  const apply = (patch: Partial<domain.Post>) => {
    const next = { ...draft, ...patch } as domain.Post;
    setDraft(next);
    onChange(next);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Icon name="inspect" size={16} />}
      title="Page metadata"
      maxWidth={760}
      footer={
        <>
          <span
            className="mr-auto inline-flex items-center gap-1.5 text-[11.5px]"
            style={{ color: "var(--ink-4)" }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: "#2bbb6e",
                boxShadow: "0 0 0 3px color-mix(in oklab, #2bbb6e 25%, transparent)",
              }}
            />
            Saved automatically
          </span>
          <Pill ghost onClick={onClose}>
            Done
          </Pill>
        </>
      }
    >
      <div className="px-0 py-0">
        <Field label="Title">
          <input
            value={draft.title ?? ""}
            onChange={(e) => apply({ title: e.target.value })}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[30px] w-full rounded-[7px] px-2.5 text-[13px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
        </Field>

        <Field label="Description" border>
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => apply({ description: e.target.value })}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="block w-full resize-y rounded-[7px] px-2.5 py-2 text-[13px] leading-[1.5] outline-none"
            style={{
              minHeight: 84,
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              fontFamily: "var(--font-ui)",
            }}
          />
          <DescriptionMeter value={draft.description ?? ""} />
        </Field>

        <Field label="Slug" border>
          <div
            className="flex h-[30px] items-center overflow-hidden rounded-[7px]"
            style={{
              border: `0.5px solid ${slugError ? "#d44a3e" : "var(--hairline-strong)"}`,
              background: "var(--canvas)",
            }}
          >
            <span
              className="flex h-full items-center px-2 text-[12px]"
              style={{
                color: "var(--ink-4)",
                fontFamily: "var(--font-mono-stack)",
                borderRight: "0.5px solid var(--hairline)",
              }}
            >
              /
            </span>
            <input
              value={draft.slug ?? ""}
              onChange={(e) => apply({ slug: e.target.value })}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="block min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] outline-none"
              style={{
                color: "var(--ink)",
                fontFamily: "var(--font-mono-stack)",
              }}
            />
          </div>
          {slugError ? (
            <Hint style={{ color: "#d44a3e" }}>{slugError}</Hint>
          ) : (
            <Hint>Auto-derived from the title. Override if you want.</Hint>
          )}
        </Field>

        <Field label="Tags" border>
          <TagInput
            tags={draft.tags ?? []}
            setTags={(t) => apply({ tags: t })}
            suggestions={allTags ?? []}
          />
          <Hint>Free-form. Press Enter to add. Existing tags suggest as you type.</Hint>
        </Field>

        <Field label="URL preview" border>
          <div
            className="flex h-[30px] items-center overflow-hidden rounded-[7px]"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "transparent",
            }}
          >
            <span
              className="flex h-full items-center px-2 text-[12px]"
              style={{
                color: "var(--ink-4)",
                fontFamily: "var(--font-mono-stack)",
                borderRight: "0.5px solid var(--hairline)",
              }}
            >
              {(siteUrl || "https://example.com").replace(/\/+$/, "")}
            </span>
            <input
              readOnly
              value={"/" + (draft.slug ?? "")}
              className="block min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[12px] outline-none"
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-mono-stack)",
              }}
            />
          </div>
        </Field>

        <Field label="Cover image" border>
          <ImageUploader
            value={draft.coverImage ?? ""}
            onChange={(v) => apply({ coverImage: v })}
            title="Drop your cover image here"
            hint="1200×630 (1.91:1) works best."
            maxSizeMB={4}
          />
          <Hint>
            Used for social previews (Open Graph / Twitter), RSS, and SEO —
            not shown on the post page itself.
          </Hint>
        </Field>

        <Field label="Author" border>
          <input
            value={draft.author ?? ""}
            onChange={(e) => apply({ author: e.target.value })}
            placeholder={siteAuthor || "Override site author…"}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[30px] w-full rounded-[7px] px-2.5 text-[13px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
            }}
          />
          <Hint>Optional override of the site author for this post.</Hint>
        </Field>

        <Field label="Canonical URL" border>
          <input
            value={draft.canonical ?? ""}
            onChange={(e) => apply({ canonical: e.target.value })}
            placeholder="https://other-site.com/original-post"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="h-[30px] w-full rounded-[7px] px-2.5 text-[13px] outline-none"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink)",
              fontFamily: "var(--font-mono-stack)",
            }}
          />
          <Hint>Set when this post is syndicated from another URL.</Hint>
        </Field>

        <Field label="Status" border>
          <div
            className="inline-flex h-[28px] items-center gap-1 rounded-[7px] p-0.5"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
            }}
          >
            <StatusBtn
              active={(draft.status || "published") === "published"}
              onClick={() => apply({ status: "published" })}
            >
              Published
            </StatusBtn>
            <StatusBtn
              active={draft.status === "draft"}
              onClick={() => apply({ status: "draft" })}
            >
              Draft
            </StatusBtn>
          </div>
          <Hint>Drafts are skipped during export — never reach the live site.</Hint>
        </Field>

        <Field label="Search engines" border>
          <label
            className="inline-flex cursor-pointer items-center gap-2 text-[12.5px]"
            style={{ color: "var(--ink)" }}
          >
            <input
              type="checkbox"
              checked={!!draft.noIndex}
              onChange={(e) => apply({ noIndex: e.target.checked })}
            />
            Hide this post from search engines
          </label>
          <Hint>Emits robots: noindex, nofollow and excludes from sitemap/feed.</Hint>
        </Field>
      </div>
    </Modal>
  );
}

function StatusBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[24px] items-center gap-1 rounded-[5px] border-0 px-2.5 text-[12px] font-medium"
      style={{
        background: active
          ? "color-mix(in oklab, var(--accent) 14%, transparent)"
          : "transparent",
        color: active ? "var(--accent)" : "var(--ink-3)",
      }}
    >
      {children}
    </button>
  );
}

function DescriptionMeter({ value }: { value: string }) {
  const len = value.length;
  let color = "var(--ink-4)";
  let label = "Used in <meta name=\"description\"> and Open Graph.";
  if (len === 0) {
    label = "Used in <meta name=\"description\"> and Open Graph.";
  } else if (len < 70) {
    color = "#c7861a";
    label = `${len} chars — aim for 70–160 for best SERP display.`;
  } else if (len <= 160) {
    color = "#2bbb6e";
    label = `${len} chars — looking good.`;
  } else {
    color = "#d44a3e";
    label = `${len} chars — over 160 may be truncated by Google.`;
  }
  return (
    <div className="mt-1 text-[11.5px]" style={{ color }}>
      {label}
    </div>
  );
}

function Field({
  label,
  children,
  border,
}: {
  label: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[110px_1fr] items-center gap-3.5 px-4 py-2.5"
      style={border ? { borderTop: "0.5px solid var(--hairline)" } : undefined}
    >
      <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

function Hint({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="mt-1 text-[11.5px]"
      style={{ color: "var(--ink-4)", ...(style ?? {}) }}
    >
      {children}
    </div>
  );
}

function TagInput({
  tags,
  setTags,
  suggestions = [],
}: {
  tags: string[];
  setTags: (t: string[]) => void;
  suggestions?: string[];
}) {
  const [v, setV] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = v.trim()
    ? suggestions
        .filter(
          (s) =>
            !tags.includes(s) &&
            s.toLowerCase().includes(v.trim().toLowerCase())
        )
        .slice(0, 6)
    : [];

  const commit = (t: string) => {
    const trimmed = t.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setV("");
      return;
    }
    setTags([...tags, trimmed]);
    setV("");
  };

  return (
    <div className="relative">
      <div
        className="flex min-h-[30px] flex-wrap items-center gap-1.5 px-1.5 py-1.5"
        style={{
          border: "0.5px solid var(--hairline-strong)",
          borderRadius: 7,
          background: "var(--canvas)",
        }}
      >
        {tags.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full pl-2 pr-1 py-0.5 text-[11.5px] font-medium"
            style={{
              background: "color-mix(in oklab, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            {t}
            <button
              type="button"
              onClick={() => setTags(tags.filter((_, j) => j !== i))}
              className="inline-flex h-3.5 w-3.5 items-center justify-center border-0 bg-transparent p-0"
              style={{ color: "var(--accent)" }}
            >
              <Icon name="x" size={9} />
            </button>
          </span>
        ))}
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && v.trim()) {
              e.preventDefault();
              commit(v);
            } else if (e.key === "Backspace" && !v && tags.length) {
              setTags(tags.slice(0, -1));
            }
          }}
          placeholder={tags.length ? "" : "Add tag…"}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-[22px] min-w-[60px] flex-1 border-0 bg-transparent px-1 text-[12.5px] outline-none"
          style={{ color: "var(--ink)" }}
        />
      </div>
      {focused && matches.length > 0 && (
        <div
          className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-[7px] py-1"
          style={{
            border: "0.5px solid var(--hairline-strong)",
            background: "var(--canvas)",
            boxShadow: "0 6px 20px color-mix(in oklab, var(--ink) 12%, transparent)",
          }}
        >
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                commit(m);
              }}
              className="flex w-full items-center justify-between border-0 bg-transparent px-3 py-1.5 text-left text-[12.5px] hover:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]"
              style={{ color: "var(--ink)" }}
            >
              <span>{m}</span>
              <span style={{ color: "var(--ink-4)", fontSize: 10.5 }}>add</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
