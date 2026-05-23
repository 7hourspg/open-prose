import { useEffect, useRef, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import {
  CrumbCurrent,
  CrumbSep,
  EditorPane,
  SavedStatus,
  WordCount,
} from "@/features/editor/EditorPane";
import { MarkdownEditor } from "@/features/editor/MarkdownEditor";
import { useProject, useSaveProject } from "@/features/projects/api";
import type { domain } from "../../wailsjs/go/models";

export const Route = createFileRoute("/projects/$projectId/home")({
  component: HomeRoute,
});

function HomeRoute() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const project = useProject(projectId);
  const save = useSaveProject();

  const [content, setContent] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const lastSavedAt = useRef<Date | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (project.data && !hydrated) {
      setContent(project.data.homeContent ?? "");
      setHydrated(true);
    }
  }, [project.data, hydrated]);

  if (!project.data || !hydrated) return null;

  const scheduleSave = (next: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const updated = { ...project.data!, homeContent: next } as domain.Project;
      try {
        await save.mutateAsync(updated);
        lastSavedAt.current = new Date();
      } catch {
        /* swallow */
      }
    }, 500);
  };

  const onChange = (next: string) => {
    setContent(next);
    if ((project.data?.homeContent ?? "") === next) {
      if (timer.current) window.clearTimeout(timer.current);
      return;
    }
    scheduleSave(next);
  };

  return (
    <EditorPane
      crumbTrail={
        <>
          <span className="flex-none">Home</span>
          <CrumbSep />
          <CrumbCurrent>The front page</CrumbCurrent>
        </>
      }
      status={
        <>
          <SavedStatus savedAt={lastSavedAt.current} />
          <WordCount markdown={content} />
        </>
      }
    >
      <MarkdownEditor
        key={projectId + ":home"}
        initialMarkdown={content}
        onChangeMarkdown={onChange}
        placeholder="A short introduction for your home page."
        header={<HomeHeader />}
      />
    </EditorPane>
  );
}

function HomeHeader() {
  return (
    <div className="mb-8">
      <h1
        className="m-0 mb-2.5"
        style={{
          fontFamily: "var(--font-serif-stack)",
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: 600,
          letterSpacing: "-.015em",
          lineHeight: 1.15,
          color: "var(--ink)",
        }}
      >
        Home
      </h1>
      <div
        className="flex flex-wrap items-center gap-3.5 text-[14px]"
        style={{ color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}
      >
        <span>Home page</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span style={{ fontFamily: "var(--font-mono-stack)", fontSize: 12.5 }}>
          /
        </span>
      </div>
    </div>
  );
}

