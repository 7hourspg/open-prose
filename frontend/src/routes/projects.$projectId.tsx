import { useEffect, useState } from "react";
import {
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  IconBtn,
  Pill,
  TbDivider,
  TbSpacer,
  Toolbar,
} from "@/components/window/Toolbar";
import {
  SavedDot,
  SbDivider,
  SbSpacer,
  StatusBar,
} from "@/components/window/StatusBar";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/Brand";
import { PreviewIndicator } from "@/components/PreviewIndicator";
import { AppSidebar } from "@/features/editor/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { ExportSheet } from "@/features/editor/ExportSheet";
import { SessionBanner } from "@/features/onboarding/SessionBanner";
import { useProject } from "@/features/projects/api";
import { useCreatePost, usePosts } from "@/features/editor/api";
import { genId, newPost, slugify } from "@/lib/project";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectLayout,
  beforeLoad: ({ params, location }) => {
    if (location.pathname.match(/^\/projects\/[^/]+\/?$/)) {
      throw redirect({
        to: "/projects/$projectId/posts",
        params: { projectId: params.projectId },
      });
    }
  },
});

const SIDEBAR_KEY = "blogeditor.sidebar.open";

function ProjectLayout() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const project = useProject(projectId);
  const posts = usePosts(projectId);
  const createPost = useCreatePost(projectId);
  const navigate = useNavigate();
  const [showExport, setShowExport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(SIDEBAR_KEY) !== "0";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "1" : "0");
  }, [sidebarOpen]);

  if (!project.data) {
    return (
      <div
        className="flex h-screen w-screen items-center justify-center text-[13px]"
        style={{ color: "var(--ink-4)" }}
      >
        Loading project…
      </div>
    );
  }

  const proj = project.data;
  const postCount = posts.data?.length ?? 0;

  const handleNewPost = async () => {
    const draft = newPost();
    draft.id = genId("post");
    draft.title = "Untitled";
    draft.slug = slugify(draft.title) || `post-${Date.now()}`;
    const saved = await createPost.mutateAsync(draft);
    navigate({
      to: "/projects/$projectId/posts/$postId",
      params: { projectId, postId: saved.id },
    });
  };

  const initial = (proj.site?.name || proj.meta?.name || "?").slice(0, 1);

  return (
    <div className="flex h-screen w-screen flex-col">
      <Toolbar>
        <IconBtn
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          onClick={() => setSidebarOpen((v) => !v)}
        >
          <Icon name="sidebar" size={15} />
        </IconBtn>
        <TbDivider />
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          title="Open another site"
          className="inline-flex h-7 max-w-[180px] flex-none items-center gap-1.5 overflow-hidden rounded-[7px] border-0 bg-transparent px-1.5 text-[12.5px] font-medium hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)] hover:text-[var(--ink)]"
          style={{ color: "var(--ink-2)" }}
        >
          <span
            className="inline-flex h-[18px] w-[18px] flex-none items-center justify-center rounded-md text-[11px] font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, black))",
              fontFamily: "var(--font-serif-stack)",
            }}
          >
            {initial}
          </span>
          <span className="min-w-0 truncate">{proj.site?.name || proj.meta?.name}</span>
          <Icon name="chevdown" size={11} />
        </button>

        <TbSpacer />

        <IconBtn title="New post" onClick={handleNewPost}>
          <Icon name="plus" size={13} /> <span>New post</span>
        </IconBtn>
        <ThemeToggle />

        <TbDivider />

        <Pill onClick={() => setShowExport(true)}>
          <Icon name="export" size={12} /> Export
        </Pill>
      </Toolbar>

      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <AppSidebar
            projectId={projectId}
            project={proj}
            postCount={postCount}
            onOpenExport={() => setShowExport(true)}
          />
        )}

        <div
          className="flex flex-1 min-w-0 min-h-0 flex-col"
          style={{ background: "var(--panel)" }}
        >
          <SessionBanner
            onExport={() => setShowExport(true)}
            onHelp={() =>
              navigate({
                to: "/projects/$projectId/help",
                params: { projectId },
              })
            }
          />
          <Outlet />
        </div>
      </div>

      <StatusBar>
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: "var(--ink-3)" }}
        >
          <BrandMark size={11} />
          <span style={{ fontWeight: 600 }}>Open Prose</span>
        </span>
        <SbDivider />
        <span>{proj.site?.name || proj.meta?.name}</span>
        <SbDivider />
        <span>
          {postCount} {postCount === 1 ? "post" : "posts"} · 2 pages
        </span>
        <SbDivider />
        <span style={{ color: "var(--ink-3)" }}>
          Template:{" "}
          <span className="capitalize">{proj.theme?.template ?? "—"}</span>
        </span>
        <SbSpacer />
        <PreviewIndicator />
        <SavedDot />
      </StatusBar>

      <ExportSheet
        open={showExport}
        onClose={() => setShowExport(false)}
        project={proj}
        postCount={postCount}
      />
      <CommandPalette
        projectId={projectId}
        posts={posts.data ?? []}
        onNewPost={handleNewPost}
        onOpenExport={() => setShowExport(true)}
      />
    </div>
  );
}

