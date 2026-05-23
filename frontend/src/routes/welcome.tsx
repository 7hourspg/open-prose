import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CreatePost,
  CreateProject,
  OpenProject,
  SaveProject,
} from "../../wailsjs/go/api/App";
import { domain } from "../../wailsjs/go/models";
import { useFirstRunCompleted } from "@/features/onboarding/api";
import { useOnboarding } from "@/features/onboarding/useOnboarding";
import { WelcomeStep } from "@/features/onboarding/WelcomeStep";
import { TemplateStep } from "@/features/onboarding/TemplateStep";
import { BasicsStep } from "@/features/onboarding/BasicsStep";
import { genId, slugify } from "@/lib/project";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const { step, draft, goTo, patch, reset } = useOnboarding();
  const { markCompleted } = useFirstRunCompleted();
  const [busy, setBusy] = useState(false);

  async function finalize(opts: { skipped: boolean }) {
    if (busy) return;
    setBusy(true);
    goTo("creating");
    try {
      const name = (draft.name || "My blog").trim();
      const template = draft.template || "minimal";
      const author = draft.author.trim();
      const url = draft.url.trim();

      const meta = await CreateProject(name, template);

      if (!opts.skipped && (author || url)) {
        try {
          const p = await OpenProject(meta.id);
          p.site.author = author;
          p.site.url = url;
          await SaveProject(p);
        } catch {
          // non-fatal — fall through, the user can edit basics later
        }
      }

      const starterId = genId("post");
      const starter = {
        id: starterId,
        title: `Hello from ${name}`,
        slug: slugify(`Hello from ${name}`),
        description: "",
        content: starterContent(name),
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as domain.Post;
      const saved = await CreatePost(meta.id, starter);

      await markCompleted();
      reset();
      window.localStorage.setItem("openprose.justOnboarded", "1");

      navigate({
        to: "/projects/$projectId/posts/$postId",
        params: { projectId: meta.id, postId: saved.id },
      });
    } finally {
      setBusy(false);
    }
  }

  const onSkip = () => finalize({ skipped: true });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        onSkip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, draft, step]);

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: "var(--bg)" }}
    >
      <header
        className="flex items-center justify-end px-6 py-4"
        style={{ borderBottom: "0.5px solid var(--hairline)" }}
      >
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="text-[12.5px] font-medium"
          style={{
            color: "var(--ink-3)",
            background: "transparent",
            border: 0,
          }}
        >
          Skip the tour
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center">
        {step === "welcome" && (
          <WelcomeStep onContinue={() => goTo("template")} onSkip={onSkip} />
        )}
        {step === "template" && (
          <TemplateStep
            selected={draft.template}
            draftName={draft.name}
            onSelect={(template) => patch({ template })}
            onContinue={() => goTo("basics")}
            onBack={() => goTo("welcome")}
          />
        )}
        {(step === "basics" || step === "creating") && (
          <BasicsStep
            name={draft.name}
            author={draft.author}
            url={draft.url}
            busy={busy || step === "creating"}
            onPatch={(p) => patch(p)}
            onContinue={() => finalize({ skipped: false })}
            onBack={() => goTo("template")}
          />
        )}
      </main>
    </div>
  );
}

function starterContent(name: string): string {
  return [
    `# Hello from ${name}`,
    "",
    "This is your first post. Replace this with anything — an essay, a build log, a rant about kerning. When you're ready to publish, click Export to write the files, or Deploy to ship them to the web.",
    "",
    "Delete this post when you don't need it anymore.",
    "",
  ].join("\n");
}
