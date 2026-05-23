import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CrumbCurrent,
  CrumbSep,
  EditorPane,
  SavedStatus,
  WordCount,
} from "@/features/editor/EditorPane";
import { MarkdownEditor } from "@/features/editor/MarkdownEditor";
import { IconBtn } from "@/components/window/Toolbar";
import { Icon } from "@/components/Icon";
import { MetaModal } from "@/features/editor/MetaModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "@/features/editor/api";
import { useProject } from "@/features/projects/api";
import { slugify } from "@/lib/project";
import { domain } from "../../../wailsjs/go/models";

export function DocEditor({
  projectId,
  postId,
}: {
  projectId: string;
  postId: string;
}) {
  const project = useProject(projectId);
  const posts = usePosts(projectId);
  const updatePost = useUpdatePost(projectId);
  const deletePost = useDeletePost(projectId);
  const navigate = useNavigate();

  const stored = useMemo(
    () => posts.data?.find((p) => p.id === postId),
    [posts.data, postId]
  );

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    for (const p of posts.data ?? []) {
      for (const t of p.tags ?? []) seen.add(t);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [posts.data]);

  const [draft, setDraft] = useState<domain.Post | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timer = useRef<number | null>(null);
  const lastSavedAt = useRef<Date | null>(null);

  useEffect(() => {
    if (stored) setDraft(stored);
  }, [stored?.id]);

  const scheduleSave = (next: domain.Post) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        await updatePost.mutateAsync(next);
        lastSavedAt.current = new Date();
      } catch {
        /* swallow */
      }
    }, 500);
  };

  const setField = (patch: Partial<domain.Post>) => {
    if (!draft) return;
    const next = { ...draft, ...patch } as domain.Post;
    setDraft(next);
    if (stored && !isPostDirty(next, stored)) {
      if (timer.current) window.clearTimeout(timer.current);
      return;
    }
    scheduleSave(next);
  };

  const setTitle = (newTitle: string) => {
    if (!draft) return;
    const patch: Partial<domain.Post> = { title: newTitle };
    if (slugTracksTitle(draft.slug ?? "", draft.title ?? "")) {
      patch.slug = slugify(newTitle);
    }
    setField(patch);
  };

  if (!draft) {
    return (
      <div
        className="flex flex-1 items-center justify-center text-[13px]"
        style={{ color: "var(--ink-4)", background: "var(--canvas)" }}
      >
        Loading…
      </div>
    );
  }

  const performDelete = () => {
    setConfirmDelete(false);
    deletePost.mutate(draft.id);
    navigate({
      to: "/projects/$projectId/posts",
      params: { projectId },
    });
  };

  return (
    <>
      <EditorPane
        crumbTrail={
          <>
            <span className="flex-none">Posts</span>
            <CrumbSep />
            <CrumbCurrent>{draft.title || "Untitled"}</CrumbCurrent>
          </>
        }
        status={
          <>
            <SavedStatus savedAt={lastSavedAt.current} />
            <WordCount markdown={draft.content ?? ""} />
          </>
        }
        rightAction={
          <>
            <IconBtn onClick={() => setShowMeta(true)} title="Edit metadata (⌘I)">
              <Icon name="inspect" size={14} /> <span>Metadata</span>
            </IconBtn>
            <IconBtn
              onClick={() => setConfirmDelete(true)}
              title="Delete post"
              className="hover:bg-destructive! hover:text-destructive-foreground!"
            >
              <Icon name="trash" size={13} />
            </IconBtn>
          </>
        }
      >
        <MarkdownEditor
          key={draft.id}
          initialMarkdown={draft.content ?? ""}
          onChangeMarkdown={(md) => setField({ content: md })}
          placeholder="Start writing your post…"
          header={
            <PostHeader
              title={draft.title}
              onTitleChange={setTitle}
              slug={draft.slug ?? ""}
              tags={draft.tags ?? []}
            />
          }
        />
      </EditorPane>

      <MetaModal
        open={showMeta}
        onClose={() => setShowMeta(false)}
        post={draft}
        siteUrl={project.data?.site?.url ?? ""}
        siteAuthor={project.data?.site?.author ?? ""}
        allTags={allTags}
        onChange={(next) =>
          setField({
            title: next.title,
            slug: next.slug,
            description: next.description,
            tags: next.tags,
            coverImage: next.coverImage,
            author: next.author,
            canonical: next.canonical,
            noIndex: next.noIndex,
            status: next.status,
          })
        }
      />

      <AlertDialog
        open={confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{draft.title || "Untitled"}" will be permanently removed. This
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function isPostDirty(a: domain.Post, b: domain.Post): boolean {
  return (
    a.title !== b.title ||
    a.slug !== b.slug ||
    a.description !== b.description ||
    a.content !== b.content ||
    JSON.stringify(a.tags ?? []) !== JSON.stringify(b.tags ?? []) ||
    a.coverImage !== b.coverImage ||
    a.author !== b.author ||
    a.canonical !== b.canonical ||
    a.noIndex !== b.noIndex ||
    a.status !== b.status
  );
}

function slugTracksTitle(slug: string, title: string): boolean {
  if (slug === "") return true;
  const base = slugify(title);
  if (slug === base) return true;
  if (base === "") return false;
  if (slug.startsWith(base + "-")) {
    return /^\d+$/.test(slug.slice(base.length + 1));
  }
  return false;
}

function PostHeader({
  title,
  onTitleChange,
  slug,
  tags,
}: {
  title: string;
  onTitleChange: (t: string) => void;
  slug: string;
  tags: string[];
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  return (
    <div className="mb-8">
      <textarea
        ref={taRef}
        rows={1}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        placeholder="Untitled"
        className="m-0 mb-2.5 block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
        style={{
          fontFamily: "var(--font-serif-stack)",
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: 600,
          letterSpacing: "-.015em",
          lineHeight: 1.15,
          color: "var(--ink)",
        }}
      />
      <div
        className="flex flex-wrap items-center gap-3.5 text-[14px]"
        style={{ color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}
      >
        <span>Post</span>
        <span style={{ color: "var(--ink-4)" }}>·</span>
        <span
          className="min-w-0 max-w-full truncate"
          style={{ fontFamily: "var(--font-mono-stack)", fontSize: 12.5 }}
        >
          /{slug}
        </span>
        {tags.length > 0 && (
          <>
            <span style={{ color: "var(--ink-4)" }}>·</span>
            <div className="flex gap-1.5">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="rounded-full px-2 py-0.5 text-[11.5px]"
                  style={{
                    background: "color-mix(in oklab, var(--ink) 7%, transparent)",
                    color: "var(--ink-3)",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
