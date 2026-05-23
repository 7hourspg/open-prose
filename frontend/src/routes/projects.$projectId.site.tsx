import { useEffect, useRef, useState } from "react";
import {
  createFileRoute,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { TemplateThumb } from "@/components/TemplateThumb";
import { ImageUploader } from "@/components/ImageUploader";
import { SortableList } from "@/components/SortableList";
import {
  useProject,
  useSaveProject,
  useTemplates,
} from "@/features/projects/api";
import { domain } from "../../wailsjs/go/models";

export const Route = createFileRoute("/projects/$projectId/site")({
  component: SiteRoute,
});

function SiteRoute() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const project = useProject(projectId);
  const templates = useTemplates();
  const save = useSaveProject();

  const [draft, setDraft] = useState<domain.Project | null>(null);
  const timer = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hash = useRouterState({
    select: (s) => (s.location.hash || "").replace(/^#/, ""),
  });

  useEffect(() => {
    if (project.data) setDraft(project.data);
  }, [project.data?.meta?.id]);

  const draftReady = !!draft;
  useEffect(() => {
    if (!draftReady || !scrollRef.current) return;
    if (!hash || hash === "identity") {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [draftReady, hash]);

  if (!draft) return null;

  const queueSave = (next: domain.Project) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      save.mutate(next);
    }, 400);
  };

  const update = (patch: Partial<domain.Project>) => {
    const next = { ...draft, ...patch } as domain.Project;
    setDraft(next);
    queueSave(next);
  };

  const setSite = (patch: Partial<domain.SiteConfig>) =>
    update({ site: { ...draft.site, ...patch } as domain.SiteConfig });
  const setHeader = (patch: Partial<domain.HeaderConfig>) =>
    update({ header: { ...draft.header, ...patch } as domain.HeaderConfig });
  const setFooter = (patch: Partial<domain.FooterConfig>) =>
    update({ footer: { ...draft.footer, ...patch } as domain.FooterConfig });
  const setTheme = (patch: Partial<domain.Theme>) =>
    update({ theme: { ...draft.theme, ...patch } as domain.Theme });

  const navigation = draft.navigation ?? [];
  const social = draft.footer?.social ?? [];

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col items-center gap-7 overflow-y-auto px-12 pb-24 pt-9 max-[1100px]:px-7 max-[1100px]:pt-7"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-[720px]">
        <h1
          className="m-0 mb-1.5 text-[30px] font-semibold tracking-tight"
          style={{
            fontFamily: "var(--font-serif-stack)",
            color: "var(--ink)",
          }}
        >
          Site
        </h1>
        <p
          className="m-0 mb-6 max-w-[56ch] text-[13.5px]"
          style={{ color: "var(--ink-3)" }}
        >
          Identity, navigation, and template — everything that's not a page. Changes
          save automatically.
        </p>

        <Card id="identity" title="Identity">
          <Field label="Site name">
            <Input
              value={draft.site?.name ?? ""}
              onChange={(v) => setSite({ name: v })}
            />
          </Field>
          <Field label="Canonical URL">
            <Input
              value={draft.site?.url ?? ""}
              onChange={(v) => setSite({ url: v })}
              placeholder="https://example.com"
              mono
            />
          </Field>
          <Field label="Author">
            <Input
              value={draft.site?.author ?? ""}
              onChange={(v) => setSite({ author: v })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.site?.description ?? ""}
              onChange={(v) => setSite({ description: v })}
            />
            <Hint>
              Used for &lt;meta name="description"&gt; and the homepage.
            </Hint>
          </Field>
          <Field label="Site icon">
            <ImageUploader
              value={draft.site?.icon ?? ""}
              onChange={(v) => setSite({ icon: v })}
              title="Drop your site icon here"
              hint="Square PNG/SVG works best. Becomes the favicon."
              maxSizeMB={2}
            />
          </Field>
          <Field label="OG image">
            <ImageUploader
              value={draft.site?.ogImage ?? ""}
              onChange={(v) => setSite({ ogImage: v })}
              title="Drop your OG image here"
              hint="1200×630 works best. Used as the default Open Graph image."
              maxSizeMB={4}
            />
          </Field>
          <Field label="Locale">
            <Input
              value={draft.site?.locale ?? ""}
              onChange={(v) => setSite({ locale: v })}
              placeholder="en"
              mono
            />
            <Hint>BCP-47 tag — e.g. en, en-US, fr-FR. Defaults to en.</Hint>
          </Field>
          <Field label="Twitter handle">
            <Input
              value={draft.site?.twitterHandle ?? ""}
              onChange={(v) => setSite({ twitterHandle: v })}
              placeholder="@yourhandle"
              mono
            />
            <Hint>Used for Twitter/X card metadata.</Hint>
          </Field>
        </Card>

        <Card id="seo" title="SEO">
          <Field label="Keywords">
            <KeywordsInput
              value={draft.site?.keywords ?? []}
              onChange={(next) => setSite({ keywords: next })}
            />
            <Hint>
              Site-wide keywords. Press Enter or comma to add.
            </Hint>
          </Field>
          <Field label="Organization name">
            <Input
              value={draft.site?.organizationName ?? ""}
              onChange={(v) => setSite({ organizationName: v })}
              placeholder={draft.site?.name ?? ""}
            />
            <Hint>Falls back to site name. Used in schema.org Organization.</Hint>
          </Field>
          <Field label="Organization logo">
            <ImageUploader
              value={draft.site?.organizationLogo ?? ""}
              onChange={(v) => setSite({ organizationLogo: v })}
              title="Drop your organization logo here"
              hint="Falls back to the site icon. Used in JSON-LD."
              maxSizeMB={2}
            />
          </Field>
        </Card>

        <Card title="Header & footer">
          <Field label="Tagline">
            <Input
              value={draft.header?.tagline ?? ""}
              onChange={(v) => setHeader({ tagline: v })}
              placeholder="Optional. Shown under the site name."
            />
          </Field>
          <Field label="Footer copyright">
            <Input
              value={draft.footer?.copyright ?? ""}
              onChange={(v) => setFooter({ copyright: v })}
            />
          </Field>
        </Card>

        <Card id="navigation" title="Navigation" right="Drag to reorder.">
          <SortableNav
            items={navigation}
            setItems={(next) => update({ navigation: next })}
          />
          <AddBtn
            onClick={() =>
              update({
                navigation: [
                  ...navigation,
                  { label: "", href: "/" } as domain.NavLink,
                ],
              })
            }
            label="Add link"
          />
        </Card>

        <Card title="Social" right="Shown in the footer.">
          <SortableSocial
            items={social}
            setItems={(next) => setFooter({ social: next })}
          />
          <AddBtn
            onClick={() =>
              setFooter({
                social: [
                  ...social,
                  { platform: "", url: "" } as domain.SocialLink,
                ],
              })
            }
            label="Add link"
          />
        </Card>

        <Card id="template" title="Template" right="Applied at export.">
          <div className="grid grid-cols-3 gap-3 p-3.5 max-[820px]:grid-cols-1">
            {(templates.data ?? []).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTheme({ template: tpl.id })}
                data-on={draft.theme?.template === tpl.id ? "1" : "0"}
                className="relative flex flex-col gap-2 rounded-[10px] p-2.5 text-left data-[on='1']:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_16%,transparent)]"
                style={{
                  border: `0.5px solid ${
                    draft.theme?.template === tpl.id
                      ? "var(--accent)"
                      : "var(--hairline-strong)"
                  }`,
                  background: "var(--canvas)",
                }}
              >
                <div
                  className="overflow-hidden rounded-[7px]"
                  style={{
                    aspectRatio: "16 / 10",
                    border: "0.5px solid var(--hairline)",
                  }}
                >
                  <TemplateThumb
                    template={tpl.id}
                    name={draft.site?.name || tpl.name}
                  />
                </div>
                <div
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {tpl.name}
                  {draft.theme?.template === tpl.id && (
                    <span
                      className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full text-white"
                      style={{ background: "var(--accent)", fontSize: 9 }}
                    >
                      <Icon name="check" size={8} />
                    </span>
                  )}
                </div>
                <div
                  className="text-[11.5px] leading-[1.4]"
                  style={{ color: "var(--ink-3)" }}
                >
                  {tpl.description}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SortableNav({
  items,
  setItems,
}: {
  items: domain.NavLink[];
  setItems: (next: domain.NavLink[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3.5 pb-3.5 pt-2.5">
      <SortableList
        items={items}
        setItems={setItems}
        getId={(_n, i) => `nav-${i}`}
        renderRow={({ item: n, index: i, isDragging, dragHandle }) => (
          <ReorderRow dragHandle={dragHandle} dragging={isDragging}>
            <Input
              value={n.label}
              onChange={(v) => {
                const next = items.slice();
                next[i] = { ...n, label: v } as domain.NavLink;
                setItems(next);
              }}
              placeholder="Label"
              inline
              style={{ flex: "1 1 40%" }}
            />
            <Input
              value={n.href}
              onChange={(v) => {
                const next = items.slice();
                next[i] = { ...n, href: v } as domain.NavLink;
                setItems(next);
              }}
              placeholder="/path"
              mono
              inline
              style={{ flex: "1 1 60%", fontSize: 12 }}
            />
            <RemoveBtn
              onClick={() => {
                const next = items.slice();
                next.splice(i, 1);
                setItems(next);
              }}
            />
          </ReorderRow>
        )}
      />
    </div>
  );
}

function SortableSocial({
  items,
  setItems,
}: {
  items: domain.SocialLink[];
  setItems: (next: domain.SocialLink[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3.5 pb-3.5 pt-2.5">
      <SortableList
        items={items}
        setItems={setItems}
        getId={(_s, i) => `soc-${i}`}
        renderRow={({ item: s, index: i, isDragging, dragHandle }) => (
          <ReorderRow dragHandle={dragHandle} dragging={isDragging}>
            <Input
              value={s.platform}
              onChange={(v) => {
                const next = items.slice();
                next[i] = { ...s, platform: v } as domain.SocialLink;
                setItems(next);
              }}
              placeholder="Platform"
              inline
              style={{ flex: "1 1 30%" }}
            />
            <Input
              value={s.url}
              onChange={(v) => {
                const next = items.slice();
                next[i] = { ...s, url: v } as domain.SocialLink;
                setItems(next);
              }}
              placeholder="https://…"
              mono
              inline
              style={{ flex: "1 1 70%", fontSize: 12 }}
            />
            <RemoveBtn
              onClick={() => {
                const next = items.slice();
                next.splice(i, 1);
                setItems(next);
              }}
            />
          </ReorderRow>
        )}
      />
    </div>
  );
}

function Card({
  id,
  title,
  right,
  children,
}: {
  id?: string;
  title: string;
  right?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="overflow-hidden rounded-xl scroll-mt-4"
      style={{
        marginBottom: 18,
        border: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--canvas) 92%, var(--panel))",
        padding: "6px 0",
      }}
    >
      <div
        className="flex items-center gap-2.5 pb-2.5 pt-3"
        style={{
          paddingLeft: 18,
          paddingRight: 18,
          borderBottom: "0.5px solid var(--hairline)",
        }}
      >
        <h3 className="m-0 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h3>
        {right && (
          <p className="m-0 ml-auto text-[12px]" style={{ color: "var(--ink-3)" }}>
            {right}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-[160px_1fr] items-center gap-3.5 py-3 max-[820px]:grid-cols-1"
      style={{
        paddingLeft: 18,
        paddingRight: 18,
        borderTop: "0.5px solid var(--hairline)",
      }}
    >
      <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>
        {label}
      </label>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 text-[11.5px]" style={{ color: "var(--ink-4)" }}>
      {children}
    </div>
  );
}

type InputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  inline?: boolean;
  style?: React.CSSProperties;
};

function Input({ value, onChange, placeholder, mono, inline, style }: InputProps) {
  if (inline) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="block h-[26px] w-full border-0 bg-transparent px-1 text-[13px] outline-none"
        style={{
          color: "var(--ink)",
          fontFamily: mono ? "var(--font-mono-stack)" : undefined,
          ...(style ?? {}),
        }}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      className="block h-[30px] w-full rounded-[7px] px-2.5 text-[13px] outline-none"
      style={{
        border: "0.5px solid var(--hairline-strong)",
        background: "var(--canvas)",
        color: "var(--ink)",
        fontFamily: mono ? "var(--font-mono-stack)" : undefined,
        ...(style ?? {}),
      }}
    />
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
  );
}

type DragHandleProps = Parameters<
  Parameters<typeof SortableList>[0]["renderRow"]
>[0]["dragHandle"];

function ReorderRow({
  children,
  dragHandle,
  dragging,
}: {
  children: React.ReactNode;
  dragHandle: DragHandleProps;
  dragging: boolean;
}) {
  return (
    <div
      className="flex h-8 items-center gap-2 rounded-lg px-1.5 py-0"
      style={{
        border: dragging
          ? "0.5px solid var(--accent)"
          : "0.5px solid var(--hairline)",
        background: "var(--canvas)",
        paddingRight: 6,
        paddingLeft: 4,
        boxShadow: dragging
          ? "0 6px 18px color-mix(in oklab, var(--accent) 25%, transparent)"
          : undefined,
      }}
    >
      <span
        {...dragHandle}
        className="inline-flex h-full w-4 items-center justify-center select-none"
        style={{ color: "var(--ink-4)", ...dragHandle.style }}
        aria-label="Drag to reorder"
      >
        <Icon name="grip" size={14} />
      </span>
      {children}
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[22px] w-[22px] items-center justify-center rounded-md border-0 bg-transparent hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] hover:text-[var(--ink)]"
      style={{ color: "var(--ink-4)" }}
    >
      <Icon name="x" size={11} />
    </button>
  );
}

function KeywordsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };

  return (
    <div
      className="flex min-h-[30px] flex-wrap items-center gap-1.5 rounded-[7px] px-2 py-1.5"
      style={{
        border: "0.5px solid var(--hairline-strong)",
        background: "var(--canvas)",
      }}
    >
      {value.map((k, i) => (
        <span
          key={`${k}-${i}`}
          className="inline-flex h-[22px] items-center gap-1 rounded-md px-2 text-[12px]"
          style={{
            background: "color-mix(in oklab, var(--ink) 6%, transparent)",
            color: "var(--ink)",
          }}
        >
          {k}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="inline-flex h-[14px] w-[14px] items-center justify-center rounded-sm border-0 bg-transparent"
            style={{ color: "var(--ink-3)" }}
            aria-label={`Remove ${k}`}
          >
            <Icon name="x" size={9} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? "Add keyword…" : ""}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="h-[22px] flex-1 min-w-[100px] border-0 bg-transparent px-1 text-[13px] outline-none"
        style={{ color: "var(--ink)" }}
      />
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-3.5 mb-3.5 inline-flex h-[26px] items-center gap-1.5 self-start rounded-md px-2.5 text-[12px] font-medium hover:text-[var(--accent)] hover:border-[var(--accent)]"
      style={{
        border: "1px dashed var(--hairline-strong)",
        background: "transparent",
        color: "var(--ink-3)",
      }}
    >
      <Icon name="plus" size={11} /> {label}
    </button>
  );
}
