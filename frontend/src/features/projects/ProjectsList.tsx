import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BrandLogo, BrandWordmark } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { TemplateThumb } from "@/components/TemplateThumb";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useDeleteProject,
  useDuplicateProject,
  useProjects,
} from "@/features/projects/api";
import { NewProjectDialog } from "@/features/projects/NewProjectDialog";

function formatRelative(d?: string | Date | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function tplPillStyle(template: string): React.CSSProperties {
  if (template === "developer")
    return {
      color: "#6e88c4",
      background: "color-mix(in oklab, #6e88c4 14%, transparent)",
    };
  if (template === "magazine")
    return {
      color: "#b5722a",
      background: "color-mix(in oklab, #b5722a 14%, transparent)",
    };
  if (template === "minimal")
    return {
      color: "#5a8862",
      background: "color-mix(in oklab, #5a8862 14%, transparent)",
    };
  return {
    color: "var(--ink-3)",
    background: "color-mix(in oklab, var(--ink) 6%, transparent)",
  };
}

export function ProjectsList() {
  const projects = useProjects();
  const dup = useDuplicateProject();
  const del = useDeleteProject();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = useMemo(
    () =>
      (projects.data ?? []).slice().sort((a, b) => {
        const ta = new Date(a.lastOpened as unknown as string).getTime() || 0;
        const tb = new Date(b.lastOpened as unknown as string).getTime() || 0;
        return tb - ta;
      }),
    [projects.data]
  );

  const open = (id: string) =>
    navigate({ to: "/projects/$projectId/posts", params: { projectId: id } });

  return (
    <>
      <div
        className="h-full w-full overflow-y-auto px-10 pb-10 pt-16 max-[1100px]:px-5 max-[1100px]:pt-8"
        style={{
          background: "color-mix(in oklab, var(--bg) 95%, black 4%)",
          backgroundImage:
            "radial-gradient(800px 400px at 20% 10%, color-mix(in oklab, var(--accent) 10%, transparent), transparent 60%), radial-gradient(700px 400px at 90% 90%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 60%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[980px] flex-col">
          <div className="mb-7 flex items-center gap-2.5">
            <BrandLogo size={28} style={{ borderRadius: 7 }} />
            <BrandWordmark size={15} style={{ color: "var(--ink-2)" }} />
          </div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h1
                className="m-0 mb-1 text-[36px] font-semibold tracking-tight"
                style={{
                  fontFamily: "var(--font-serif-stack)",
                  color: "var(--ink)",
                }}
              >
                Your sites
              </h1>
              <p className="m-0 text-[14px]" style={{ color: "var(--ink-3)" }}>
                Pick one to keep writing, or start a new blog. Everything stays on this Mac.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-3 gap-3.5 max-[1100px]:grid-cols-2 max-[820px]:grid-cols-1">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex min-h-full flex-col items-center justify-center gap-1.5 rounded-[14px] border border-dashed p-5 text-center transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_5%,transparent)]"
              style={{
                borderColor: "var(--hairline-strong)",
                color: "var(--ink-3)",
              }}
            >
              <span
                className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon name="plus" size={16} />
              </span>
              <b
                className="text-[13px] font-semibold"
                style={{ color: "var(--ink)" }}
              >
                New site
              </b>
              <span className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                Pick a name and a template to begin.
              </span>
            </button>

            {sorted.map((p) => (
              <div
                key={p.id}
                onClick={() => open(p.id)}
                className="group relative flex cursor-default flex-col gap-3 rounded-[14px] p-3.5 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(40,32,18,.10)]"
                style={{
                  background: "var(--panel)",
                  border: "0.5px solid var(--hairline)",
                }}
              >
                <div
                  className="overflow-hidden rounded-[10px]"
                  style={{
                    aspectRatio: "16 / 10",
                    border: "0.5px solid var(--hairline)",
                  }}
                >
                  <TemplateThumb template={p.template} name={p.name} />
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="m-0 text-[14px] font-semibold"
                      style={{ color: "var(--ink)" }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="m-0 mt-0.5 text-[11.5px]"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {p.postCount} {p.postCount === 1 ? "post" : "posts"}
                    </p>
                  </div>
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize"
                    style={tplPillStyle(p.template)}
                  >
                    {p.template}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: "var(--ink-4)" }}
                >
                  <span>
                    Opened {formatRelative(p.lastOpened as unknown as string)}
                  </span>
                </div>
                <div className="absolute right-2.5 top-2.5 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      dup.mutate(p.id);
                    }}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-md"
                    style={{
                      background: "color-mix(in oklab, var(--panel) 85%, transparent)",
                      border: "0.5px solid var(--hairline)",
                      color: "var(--ink-3)",
                    }}
                  >
                    <Icon name="duplicate" size={12} />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                        del.mutate(p.id);
                      }
                    }}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-md"
                    style={{
                      background: "color-mix(in oklab, var(--panel) 85%, transparent)",
                      border: "0.5px solid var(--hairline)",
                      color: "var(--ink-3)",
                    }}
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {projects.isLoading && (
            <div
              className="mt-12 text-center text-[13px]"
              style={{ color: "var(--ink-4)" }}
            >
              Loading…
            </div>
          )}
          {!projects.isLoading && sorted.length === 0 && (
            <div
              className="mt-12 text-center text-[13px]"
              style={{ color: "var(--ink-4)" }}
            >
              No sites yet. Click <b style={{ color: "var(--ink-2)" }}>New site</b> to
              get started.
            </div>
          )}
        </div>
      </div>

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
