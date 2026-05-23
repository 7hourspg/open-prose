import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { SortableList } from "@/components/SortableList";
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
import { useDeletePost, useReorderPosts } from "@/features/editor/api";
import { domain } from "../../../wailsjs/go/models";

type DragHandle = Parameters<
  Parameters<typeof SortableList>[0]["renderRow"]
>[0]["dragHandle"];

type Props = {
  projectId: string;
  posts: domain.Post[];
  activePostId?: string;
  onNewPost: () => void;
};

export function PagesList({
  projectId,
  posts,
  activePostId,
  onNewPost,
}: Props) {
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<domain.Post | null>(null);
  const navigate = useNavigate();
  const deletePost = useDeletePost(projectId);
  const reorderPosts = useReorderPosts(projectId);

  const requestDelete = (post: domain.Post) => setConfirmDelete(post);

  const performDelete = () => {
    const post = confirmDelete;
    setConfirmDelete(null);
    if (!post) return;
    deletePost.mutate(post.id);
    if (post.id === activePostId) {
      navigate({
        to: "/projects/$projectId/posts",
        params: { projectId },
      });
    }
  };

  const filtered = posts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [
      p.title ?? "",
      p.description ?? "",
      (p.tags ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <div
      className="flex w-[320px] min-h-0 flex-none flex-col max-[1100px]:w-[264px]"
      style={{
        borderRight: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--panel) 92%, var(--bg))",
      }}
    >
      <div
        className="flex h-11 flex-none items-center gap-2 px-3"
        style={{ borderBottom: "0.5px solid var(--hairline)" }}
      >
        <div
          className="flex h-[26px] flex-1 items-center gap-1.5 rounded-[7px] px-2"
          style={{
            background: "color-mix(in oklab, var(--ink) 6%, transparent)",
            color: "var(--ink-3)",
          }}
        >
          <Icon name="search" size={12} />
          <input
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="block min-w-0 flex-1 border-0 bg-transparent text-[12.5px] outline-none"
            style={{ color: "var(--ink)" }}
          />
        </div>
        <button
          type="button"
          onClick={onNewPost}
          title="New post"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[7px] border-0 bg-transparent hover:bg-[color-mix(in_oklab,var(--ink)_7%,transparent)]"
          style={{ color: "var(--ink-2)" }}
        >
          <Icon name="plus" size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3 pt-1.5 thin-scrollbar">
        <Group title="Pages" />
        <PageRow
          to="/projects/$projectId/home"
          params={{ projectId }}
          icon="home"
          title="Home"
          excerpt="The front page."
          active={false}
        />
        <PageRow
          to="/projects/$projectId/about"
          params={{ projectId }}
          icon="site"
          title="About"
          excerpt="A short introduction."
          active={false}
        />

        <Group title="Posts" right={String(filtered.length)} />
        {query.trim()
          ? filtered.map((p) => (
              <PageRow
                key={p.id}
                to="/projects/$projectId/posts/$postId"
                params={{ projectId, postId: p.id }}
                icon="pages"
                title={p.title || "Untitled"}
                excerpt={p.description || ""}
                tags={p.tags ?? []}
                updated={p.updatedAt as unknown as string}
                active={p.id === activePostId}
                isDraft={p.status === "draft"}
                muted
                onDelete={() => requestDelete(p)}
              />
            ))
          : posts.length > 0 && (
              <SortableList
                items={posts}
                setItems={(next) =>
                  reorderPosts.mutate(next.map((p) => p.id))
                }
                getId={(p) => p.id}
                renderRow={({ item: p, dragHandle }) => (
                  <PageRow
                    to="/projects/$projectId/posts/$postId"
                    params={{ projectId, postId: p.id }}
                    icon="pages"
                    title={p.title || "Untitled"}
                    excerpt={p.description || ""}
                    tags={p.tags ?? []}
                    updated={p.updatedAt as unknown as string}
                    active={p.id === activePostId}
                    isDraft={p.status === "draft"}
                    muted
                    onDelete={() => requestDelete(p)}
                    dragHandle={dragHandle}
                  />
                )}
              />
            )}

        {filtered.length === 0 && (
          <div
            className="px-3 py-6 text-center text-[12px]"
            style={{ color: "var(--ink-4)" }}
          >
            {posts.length === 0 ? "No posts yet." : "No matches."}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `"${confirmDelete.title || "Untitled"}" will be permanently removed. This can't be undone.`
                : ""}
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
    </div>
  );
}

function Group({ title, right }: { title: string; right?: string }) {
  return (
    <div
      className="flex items-center justify-between px-2 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[.07em]"
      style={{ color: "var(--ink-4)" }}
    >
      <span>{title}</span>
      {right && (
        <span
          className="text-[11px] font-medium normal-case tracking-normal"
          style={{ color: "var(--ink-4)" }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function PageRow({
  to,
  params,
  icon,
  title,
  excerpt,
  tags,
  updated,
  active,
  isDraft,
  muted,
  onDelete,
  dragHandle,
}: {
  to: string;
  params: Record<string, string>;
  icon: "site" | "about" | "pages" | "home";
  title: string;
  excerpt: string;
  tags?: string[];
  updated?: string;
  active: boolean;
  isDraft?: boolean;
  muted?: boolean;
  onDelete?: () => void;
  dragHandle?: DragHandle;
}) {
  return (
    <div
      className="group relative"
      style={{
        background: active ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "transparent",
        borderRadius: 8,
      }}
    >
      {dragHandle && (
        <span
          {...dragHandle}
          aria-label="Drag to reorder"
          className="absolute left-0 top-0 z-20 flex h-full w-5 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--ink-4)", ...dragHandle.style }}
        >
          <Icon name="grip" size={11} />
        </span>
      )}
      <Link
        to={to as never}
        params={params as never}
        className="flex items-start gap-3 rounded-lg p-2.5 pr-12 hover:bg-[color-mix(in_oklab,var(--ink)_4%,transparent)]"
      >
        {active && (
          <span
            className="absolute bottom-4 left-0.5 top-4 w-0.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
        )}
        <div
          className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-md text-[11px] font-semibold"
          style={{
            background: muted
              ? "color-mix(in oklab, var(--ink) 8%, transparent)"
              : "color-mix(in oklab, var(--accent) 14%, transparent)",
            color: muted ? "var(--ink-3)" : "var(--accent)",
          }}
        >
          <Icon name={icon} size={11} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center gap-1.5 truncate text-[13px] font-semibold leading-tight"
            style={{ color: "var(--ink)" }}
          >
            <span className="truncate">{title}</span>
            {isDraft && (
              <span
                className="flex-none rounded-sm px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[.05em]"
                style={{
                  background: "color-mix(in oklab, #c7861a 18%, transparent)",
                  color: "#c7861a",
                }}
              >
                Draft
              </span>
            )}
          </div>
          {excerpt && (
            <div
              className="mt-0.5 line-clamp-2 text-[11.5px] leading-[1.4]"
              style={{ color: "var(--ink-3)" }}
            >
              {excerpt}
            </div>
          )}
          {(updated || (tags && tags.length > 0)) && (
            <div
              className="mt-1.5 flex items-center gap-2 text-[10.5px] tabular-nums"
              style={{ color: "var(--ink-4)" }}
            >
              {updated && <span>{formatTime(updated)}</span>}
              {tags && tags.length > 0 && (
                <span
                  className="inline-block h-0.5 w-0.5 rounded-full"
                  style={{ background: "var(--ink-4)" }}
                />
              )}
              {(tags ?? []).slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="rounded-sm px-1.5 py-px text-[10px] font-medium"
                  style={{
                    background: active
                      ? "color-mix(in oklab, var(--accent) 18%, transparent)"
                      : "color-mix(in oklab, var(--ink) 8%, transparent)",
                    color: active ? "var(--accent)" : "var(--ink-3)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete "${title}"`}
          title="Delete post"
          onClick={onDelete}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-150 hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive group-hover:opacity-100"
        >
          <Icon name="trash" size={15} />
        </button>
      )}
    </div>
  );
}

function formatTime(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString();
}
