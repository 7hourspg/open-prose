import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/window/Modal";
import { Pill } from "@/components/window/Toolbar";
import { Icon } from "@/components/Icon";
import { StatusPill } from "@/components/StatusPill";
import { useSaveProject } from "@/features/projects/api";
import { useToolchain } from "@/lib/toolchain";
import { startPreview, stopPreview, usePreview } from "@/lib/preview";
import {
  DeployVercel,
  ExportProjectByID,
  IsExportedProject,
  OpenFolder,
  OpenURL,
  PickExportDir,
} from "../../../wailsjs/go/api/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { domain } from "../../../wailsjs/go/models";

type ExportArgs = { projectId: string; outputDir: string };

async function ensureExported({
  projectId,
  outputDir,
}: ExportArgs): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const req = {
    projectId,
    outputDir,
  } as unknown as domain.ExportRequest;
  try {
    const r = await ExportProjectByID(req);
    if (r.ok) return { ok: true, path: r.path };
    return { ok: false, message: r.message || "export failed" };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}

type Hint = {
  title: string;
  body: string;
  cta?: { label: string; onClick: () => void };
};

function detectHint(lines: string[], summary: string): Hint | null {
  const text = (summary + "\n" + lines.join("\n")).toLowerCase();
  if (
    text.includes("no existing credentials") ||
    text.includes("please sign in") ||
    text.includes("login required")
  ) {
    return {
      title: "Vercel needs you to log in",
      body: "The browser tab should have opened on its own. If you canceled it, just click Deploy again.",
    };
  }
  if (text.includes("eacces") || text.includes("permission denied")) {
    return {
      title: "Permission issue with the export folder",
      body: "Try moving the project to a folder you own (e.g. Documents) and pick it again.",
    };
  }
  if (
    text.includes("enotfound") ||
    text.includes("eai_again") ||
    text.includes("getaddrinfo") ||
    text.includes("network is unreachable")
  ) {
    return {
      title: "No internet connection",
      body: "Reconnect and try again.",
    };
  }
  if (
    text.includes("no package.json") ||
    text.includes("not a project dir")
  ) {
    return {
      title: "Project files were missing",
      body: "Open Prose just re-exported them. Click again and it should work.",
    };
  }
  if (text.includes("eaddrinuse")) {
    return {
      title: "Port 3000 was busy",
      body: "Next.js falls back to 3001 automatically. Click Run locally again.",
    };
  }
  return null;
}

function ErrorPanel({
  summary,
  lines,
}: {
  summary: string;
  lines: string[];
}) {
  const tail = lines.slice(-20);
  const hint = detectHint(lines, summary);
  return (
    <div
      className="rounded-md p-2.5 text-[12px]"
      style={{
        background: "color-mix(in oklab, #d44a3e 12%, transparent)",
        color: "#d44a3e",
      }}
    >
      <div className="font-semibold">Failed</div>
      <div className="mt-1 text-[11.5px]">{summary}</div>
      {hint && (
        <div
          className="mt-2 rounded p-2"
          style={{
            background: "color-mix(in oklab, #d44a3e 18%, transparent)",
          }}
        >
          <div className="text-[11.5px] font-semibold">{hint.title}</div>
          <div className="mt-0.5 text-[11.5px]">{hint.body}</div>
        </div>
      )}
      {tail.length > 0 && (
        <details className="mt-2">
          <summary
            className="cursor-pointer text-[11px] font-medium"
            style={{ color: "#d44a3e" }}
          >
            What went wrong (last {tail.length} lines)
          </summary>
          <div
            className="mt-1.5 max-h-[160px] overflow-y-auto rounded p-2 text-[11px] leading-[1.45]"
            style={{
              background: "color-mix(in oklab, var(--ink) 80%, transparent)",
              color: "#fff",
              fontFamily: "var(--font-mono-stack)",
            }}
          >
            {tail.map((l, i) => (
              <div key={i} className="whitespace-pre">
                {l}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(tail.join("\n"))}
            className="mt-1.5 inline-flex h-6 items-center gap-1 rounded-md border-0 px-2 text-[11px] font-medium"
            style={{
              background: "color-mix(in oklab, #d44a3e 18%, transparent)",
              color: "#d44a3e",
            }}
          >
            <Icon name="duplicate" size={10} /> Copy log
          </button>
        </details>
      )}
    </div>
  );
}

function ToolchainRow() {
  const toolchain = useToolchain();
  const node = toolchain.data?.node
    ? { tone: "ready" as const, label: `Node ${toolchain.data.nodeVersion ?? ""}` }
    : { tone: "missing" as const, label: "Node missing" };
  const npm = toolchain.data?.npm
    ? { tone: "ready" as const, label: `npm ${toolchain.data.npmVersion ?? ""}` }
    : { tone: "missing" as const, label: "npm missing" };
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <StatusPill tone={node.tone} label={node.label} />
      <StatusPill tone={npm.tone} label={npm.label} />
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  project: domain.Project;
  postCount: number;
};

export function ExportSheet({ open, onClose, project, postCount }: Props) {
  const [folder, setFolder] = useState<string>(
    project.export?.lastOutputDir ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<domain.ExportResult | null>(null);
  const [postsOnly, setPostsOnly] = useState(false);
  const saveProject = useSaveProject();

  useEffect(() => {
    if (open) {
      setFolder(project.export?.lastOutputDir ?? "");
      setResult(null);
    }
  }, [open, project.export?.lastOutputDir]);

  // Default mode: if the target folder already contains an exported project
  // (heuristic: package.json present), assume the user is re-exporting and
  // wants to preserve their custom code. They can still flip the radio.
  useEffect(() => {
    let cancelled = false;
    if (!folder) {
      setPostsOnly(false);
      return;
    }
    IsExportedProject(folder).then((exists) => {
      if (!cancelled) setPostsOnly(exists);
    });
    return () => { cancelled = true; };
  }, [folder]);

  const handlePick = async () => {
    const seed = folder || project.export?.lastOutputDir || "";
    const picked = await PickExportDir(seed);
    if (!picked) return;
    setFolder(picked);
    const updated = {
      ...project,
      export: { ...(project.export ?? {}), lastOutputDir: picked },
    } as domain.Project;
    try {
      await saveProject.mutateAsync(updated);
    } catch {
      // non-fatal; folder still works for this session via local state
    }
  };

  const handleExport = async () => {
    if (!folder) return;
    setBusy(true);
    try {
      const req = {
        projectId: project.meta.id,
        outputDir: folder,
        postsOnly,
      } as unknown as domain.ExportRequest;
      const r = await ExportProjectByID(req);
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Icon name="rocket" size={16} />}
      title="Export site"
      maxWidth={580}
      footer={
        <>
          <Pill ghost onClick={onClose}>
            Cancel
          </Pill>
          <Pill onClick={handleExport} disabled={busy || !folder}>
            <Icon name="export" size={12} /> {busy ? "Exporting…" : postsOnly ? "Update content" : "Export now"}
          </Pill>
        </>
      }
    >
      <div className="px-0 py-0">
        <Step
          n={1}
          title="Destination folder"
          body={
            folder
              ? "Re-exporting overwrites the folder's contents."
              : "Pick where the exported site will be written. We'll remember it for next time."
          }
        >
          <div
            className="mt-1 flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[12px]"
            style={{
              border: "0.5px solid var(--hairline-strong)",
              background: "var(--canvas)",
              color: "var(--ink-2)",
              fontFamily: "var(--font-mono-stack)",
            }}
          >
            <Icon name="folder" size={13} />
            <span className="min-w-0 flex-1 truncate">
              {folder || "No folder selected"}
            </span>
            <button
              type="button"
              onClick={handlePick}
              className="ml-auto border-0 bg-transparent text-[12px] font-medium"
              style={{ color: "var(--accent)", fontFamily: "var(--font-ui)" }}
            >
              {folder ? "Change…" : "Pick…"}
            </button>
          </div>
        </Step>

        <Step
          n={2}
          title="Mode"
          body={folder ? undefined : "Pick a folder first."}
        >
          <ModeChooser
            postsOnly={postsOnly}
            onChange={setPostsOnly}
            disabled={!folder}
          />
        </Step>

        <Step n={3} title="Summary" body="What will be written to disk.">
          <div className="mt-1 grid grid-cols-2 gap-2 max-[1100px]:grid-cols-1">
            <SummaryItem k="Site" v={project.site?.name ?? "—"} />
            <SummaryItem k="Template" v={project.theme?.template ?? "—"} capV />
            <SummaryItem k="Posts" v={`${postCount} mdx files`} />
            <SummaryItem k="Pages" v="2 (home + about)" />
            <SummaryItem k="Includes" v="RSS · Sitemap · OG" />
            <SummaryItem k="Stack" v="Next 16 · Tailwind 4" />
          </div>
        </Step>

        <Step
          n={4}
          title="After export"
          body={
            <>
              The folder is yours. Run{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono-stack)",
                  fontSize: 11.5,
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "color-mix(in oklab, var(--ink) 6%, transparent)",
                }}
              >
                npm install &amp;&amp; npm run dev
              </code>{" "}
              to preview, or push it to any host.
            </>
          }
        />

        {result && (
          <div
            className="mx-4 mb-3 rounded-md px-3 py-2 text-[12px]"
            style={{
              background: result.ok
                ? "color-mix(in oklab, #2bbb6e 12%, transparent)"
                : "color-mix(in oklab, #d44a3e 12%, transparent)",
              color: result.ok ? "#1a8a4f" : "#d44a3e",
            }}
          >
            <div>
              {result.ok
                ? `Exported ${result.posts} posts to ${result.path}`
                : result.message}
            </div>
            {result.ok && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => OpenFolder(result.path)}
                  className="inline-flex h-6 items-center gap-1 rounded-md border-0 px-2 text-[11.5px] font-medium"
                  style={{
                    background: "color-mix(in oklab, #1a8a4f 15%, transparent)",
                    color: "#1a8a4f",
                  }}
                >
                  <Icon name="folder" size={11} /> Open folder
                </button>
              </div>
            )}
          </div>
        )}

        {folder && (
          <PreviewPanel projectId={project.meta.id} outputDir={folder} />
        )}
        {folder && (
          <DeployPanel projectId={project.meta.id} outputDir={folder} />
        )}
      </div>
    </Modal>
  );
}

function PreviewPanel({ projectId, outputDir }: ExportArgs) {
  const toolchain = useToolchain();
  const preview = usePreview();
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const logRef = useRef<HTMLDivElement | null>(null);

  const runningHere = !!preview.data?.running;

  useEffect(() => {
    const off = EventsOn("preview:log", (line: string) =>
      setLines((ls) => [...ls, line])
    );
    return off;
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const hasNode = !!toolchain.data?.node;
  const hasNpm = !!toolchain.data?.npm;
  const ready = hasNode && hasNpm;

  const onRun = async () => {
    setLines([]);
    setError(null);
    setBusy(true);
    setStatusText("Preparing files…");
    try {
      const exp = await ensureExported({ projectId, outputDir });
      if (!exp.ok) {
        setError(exp.message);
        return;
      }
      setStatusText("Starting dev server…");
      await startPreview(exp.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  const onStop = async () => {
    await stopPreview();
    setLines([]);
  };

  return (
    <div
      className="mx-4 mb-2 mt-3 rounded-md p-3"
      style={{
        border: "0.5px solid var(--hairline-strong)",
        background: "color-mix(in oklab, var(--ink) 3%, transparent)",
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.06em]"
        style={{ color: "var(--ink-3)" }}
      >
        <Icon name="rocket" size={11} />
        <span>Preview locally</span>
      </div>

      <ToolchainRow />

      {!toolchain.isLoading && !ready ? (
        <button
          type="button"
          onClick={() => OpenURL("https://nodejs.org/en/download")}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border-0 px-2.5 text-[12px] font-medium"
          style={{
            background: "color-mix(in oklab, var(--accent) 16%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon name="export" size={11} /> Install Node
        </button>
      ) : runningHere && preview.data ? (
        <div>
          <div
            className="mb-2 flex items-center gap-2 text-[12.5px]"
            style={{ color: "#1a8a4f" }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#2bbb6e" }}
            />
            <span>Live at</span>
            <span style={{ fontFamily: "var(--font-mono-stack)" }}>
              {preview.data.url}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => OpenURL(preview.data!.url)}
              className="inline-flex h-7 items-center gap-1 rounded-md border-0 px-2.5 text-[12px] font-medium"
              style={{
                background: "color-mix(in oklab, #1a8a4f 15%, transparent)",
                color: "#1a8a4f",
              }}
            >
              <Icon name="rocket" size={11} /> Open
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(preview.data!.url)}
              className="inline-flex h-7 items-center gap-1 rounded-md border-0 px-2.5 text-[12px] font-medium"
              style={{
                background: "color-mix(in oklab, #1a8a4f 15%, transparent)",
                color: "#1a8a4f",
              }}
            >
              <Icon name="duplicate" size={11} /> Copy
            </button>
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-7 items-center gap-1 rounded-md border-0 px-2.5 text-[12px] font-medium"
              style={{
                background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                color: "var(--ink-2)",
              }}
            >
              <Icon name="x" size={11} /> Stop
            </button>
          </div>
        </div>
      ) : busy ? (
        <div>
          <div className="mb-1.5 text-[12px]" style={{ color: "var(--ink-3)" }}>
            {statusText || "Working…"}
          </div>
          <div
            ref={logRef}
            className="h-[140px] overflow-y-auto rounded-md p-2 text-[11px] leading-[1.45]"
            style={{
              background: "color-mix(in oklab, var(--ink) 6%, transparent)",
              color: "var(--ink-2)",
              fontFamily: "var(--font-mono-stack)",
            }}
          >
            {lines.length === 0 ? (
              <span style={{ color: "var(--ink-4)" }}>
                Waiting for output…
              </span>
            ) : (
              lines.map((l, i) => (
                <div key={i} className="whitespace-pre">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={onRun}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border-0 px-3 text-[12.5px] font-semibold"
            style={{
              background: "color-mix(in oklab, var(--accent) 16%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Icon name="rocket" size={12} /> Run locally
          </button>
          <div className="mt-1.5 text-[11px]" style={{ color: "var(--ink-4)" }}>
            Open Prose writes the latest files, then starts a dev server at
            localhost:3000. First run installs dependencies.
          </div>
          {error && (
            <div className="mt-2">
              <ErrorPanel summary={error} lines={lines} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeployPanel({ projectId, outputDir }: ExportArgs) {
  const toolchain = useToolchain();
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>("");
  const [lines, setLines] = useState<string[]>([]);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy) return;
    const off = EventsOn("deploy:log", (line: string) => {
      setLines((ls) => [...ls, line]);
    });
    return off;
  }, [busy]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const hasNode = !!toolchain.data?.node;
  const hasNpm = !!toolchain.data?.npm;
  const ready = hasNode && hasNpm;

  const onDeploy = async () => {
    setLines([]);
    setLiveUrl(null);
    setError(null);
    setBusy(true);
    setStatusText("Preparing files…");
    try {
      const exp = await ensureExported({ projectId, outputDir });
      if (!exp.ok) {
        setError(exp.message);
        return;
      }
      setStatusText("Deploying… (30–60s on first run)");
      const url = await DeployVercel(exp.path);
      setLiveUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setStatusText("");
    }
  };

  return (
    <div
      className="mx-4 mb-4 mt-3 rounded-md p-3"
      style={{
        border: "0.5px solid var(--hairline-strong)",
        background: "color-mix(in oklab, var(--accent) 4%, transparent)",
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.06em]"
        style={{ color: "var(--ink-3)" }}
      >
        <Icon name="rocket" size={11} />
        <span>Deploy</span>
      </div>

      <ToolchainRow />

      {!toolchain.isLoading && !ready ? (
        <button
          type="button"
          onClick={() => OpenURL("https://nodejs.org/en/download")}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border-0 px-2.5 text-[12px] font-medium"
          style={{
            background: "color-mix(in oklab, var(--accent) 16%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Icon name="export" size={11} /> Install Node
        </button>
      ) : (
        <div>
          {!busy && !liveUrl && !error && (
            <>
              <button
                type="button"
                onClick={onDeploy}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border-0 px-3 text-[12.5px] font-semibold"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                <Icon name="rocket" size={12} /> Deploy to Vercel
              </button>
              <div
                className="mt-1.5 text-[11px]"
                style={{ color: "var(--ink-4)" }}
              >
                Free hobby tier · auto SSL · custom domain ready. First run
                opens your browser to log in.
              </div>
            </>
          )}

          {busy && (
            <div>
              <div
                className="mb-1.5 text-[12px]"
                style={{ color: "var(--ink-3)" }}
              >
                {statusText || "Working…"}
              </div>
              <div
                ref={logRef}
                className="h-[140px] overflow-y-auto rounded-md p-2 font-mono text-[11px] leading-[1.45]"
                style={{
                  background: "color-mix(in oklab, var(--ink) 6%, transparent)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono-stack)",
                }}
              >
                {lines.length === 0 ? (
                  <span style={{ color: "var(--ink-4)" }}>
                    Waiting for output…
                  </span>
                ) : (
                  lines.map((l, i) => (
                    <div key={i} className="whitespace-pre">
                      {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {liveUrl && (
            <div
              className="rounded-md p-2.5"
              style={{
                background: "color-mix(in oklab, #2bbb6e 12%, transparent)",
                color: "#1a8a4f",
              }}
            >
              <div className="mb-2 text-[12.5px] font-semibold">Live!</div>
              <div
                className="mb-2 truncate text-[11.5px]"
                style={{ fontFamily: "var(--font-mono-stack)" }}
              >
                {liveUrl}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => OpenURL(liveUrl)}
                  className="inline-flex h-6 items-center gap-1 rounded-md border-0 px-2 text-[11.5px] font-medium"
                  style={{
                    background: "color-mix(in oklab, #1a8a4f 15%, transparent)",
                    color: "#1a8a4f",
                  }}
                >
                  <Icon name="rocket" size={11} /> Open
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(liveUrl)}
                  className="inline-flex h-6 items-center gap-1 rounded-md border-0 px-2 text-[11.5px] font-medium"
                  style={{
                    background: "color-mix(in oklab, #1a8a4f 15%, transparent)",
                    color: "#1a8a4f",
                  }}
                >
                  <Icon name="duplicate" size={11} /> Copy
                </button>
              </div>
            </div>
          )}

          {error && <ErrorPanel summary={error} lines={lines} />}
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: number;
  title: string;
  body: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-[28px_1fr] gap-3 px-4 py-4"
      style={{ borderTop: n === 1 ? "0" : "0.5px solid var(--hairline)" }}
    >
      <span
        className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold"
        style={{
          background: "color-mix(in oklab, var(--accent) 14%, transparent)",
          color: "var(--accent)",
        }}
      >
        {n}
      </span>
      <div>
        <h4
          className="m-0 mb-1 text-[13.5px] font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {title}
        </h4>
        <p className="m-0 mb-2 text-[12px] leading-[1.5]" style={{ color: "var(--ink-3)" }}>
          {body}
        </p>
        {children}
      </div>
    </div>
  );
}

function SummaryItem({ k, v, capV }: { k: string; v: string; capV?: boolean }) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-[7px] px-3 py-2"
      style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}
    >
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[.06em]"
        style={{ color: "var(--ink-4)" }}
      >
        {k}
      </span>
      <span
        className="text-[13px] font-medium tabular-nums"
        style={{ color: "var(--ink)", textTransform: capV ? "capitalize" : "none" }}
      >
        {v}
      </span>
    </div>
  );
}

function ModeChooser({
  postsOnly,
  onChange,
  disabled,
}: {
  postsOnly: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-1 flex flex-col gap-2">
      <ModeOption
        on={!postsOnly}
        onClick={() => onChange(false)}
        title="Full export"
        body="Overwrites template files. Use for the first export, or when you want fresh app updates."
        disabled={disabled}
      />
      <ModeOption
        on={postsOnly}
        onClick={() => onChange(true)}
        title="Posts only"
        body="Refreshes posts, media, and site settings. Leaves layout.tsx, globals.css, components, and package.json alone — your custom code is safe."
        disabled={disabled}
      />
    </div>
  );
}

function ModeOption({
  on,
  onClick,
  title,
  body,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  title: string;
  body: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-on={on ? "1" : "0"}
      className="flex items-start gap-2.5 rounded-[7px] px-3 py-2.5 text-left disabled:opacity-50 data-[on='1']:[--mode-bg:color-mix(in_oklab,var(--accent)_8%,transparent)] data-[on='1']:[--mode-border:var(--accent)] [--mode-bg:color-mix(in_oklab,var(--ink)_3%,transparent)] [--mode-border:var(--hairline-strong)]"
      style={{
        border: "0.5px solid var(--mode-border)",
        background: "var(--mode-bg)",
      }}
    >
      <span
        aria-hidden="true"
        className="mt-[3px] flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full"
        style={{
          border: `1.5px solid ${on ? "var(--accent)" : "var(--ink-4)"}`,
        }}
      >
        {on && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="text-[13px] font-semibold"
          style={{ color: on ? "var(--accent)" : "var(--ink)" }}
        >
          {title}
        </div>
        <div
          className="mt-0.5 text-[11.5px] leading-[1.5]"
          style={{ color: "var(--ink-3)" }}
        >
          {body}
        </div>
      </div>
    </button>
  );
}
