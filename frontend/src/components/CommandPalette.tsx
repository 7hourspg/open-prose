import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icon } from "@/components/Icon";
import { domain } from "../../wailsjs/go/models";

type Props = {
  projectId: string;
  posts: domain.Post[];
  onNewPost: () => void;
  onOpenExport: () => void;
};

export function CommandPalette({
  projectId,
  posts,
  onNewPost,
  onOpenExport,
}: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmd = isMac ? e.metaKey : e.ctrlKey;
      if (cmd && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  const goPost = (postId: string) => {
    close();
    navigate({
      to: "/projects/$projectId/posts/$postId",
      params: { projectId, postId },
    });
  };

  const goPage = (to: string) => {
    close();
    navigate({ to: to as never, params: { projectId } as never });
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Quick switcher"
      description="Jump to a post, page, or action."
    >
      <CommandInput placeholder="Search posts and actions…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => goPage("/projects/$projectId/home")}>
            <Icon name="site" size={14} /> <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => goPage("/projects/$projectId/about")}>
            <Icon name="about" size={14} /> <span>About</span>
          </CommandItem>
          <CommandItem onSelect={() => goPage("/projects/$projectId/site")}>
            <Icon name="settings" size={14} /> <span>Site settings</span>
          </CommandItem>
          <CommandItem onSelect={() => goPage("/projects/$projectId/posts")}>
            <Icon name="pages" size={14} /> <span>All posts</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              close();
              onNewPost();
            }}
          >
            <Icon name="plus" size={14} /> <span>New post</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              close();
              onOpenExport();
            }}
          >
            <Icon name="export" size={14} /> <span>Export site…</span>
          </CommandItem>
        </CommandGroup>

        {posts.length > 0 && (
          <CommandGroup heading="Posts">
            {posts.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.title} ${p.slug} ${(p.tags ?? []).join(" ")}`}
                onSelect={() => goPost(p.id)}
              >
                <Icon name="pages" size={14} />
                <span className="truncate">{p.title || "Untitled"}</span>
                {p.status === "draft" && (
                  <span
                    className="ml-1 rounded-sm px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-[.05em]"
                    style={{
                      background:
                        "color-mix(in oklab, #c7861a 18%, transparent)",
                      color: "#c7861a",
                    }}
                  >
                    Draft
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
