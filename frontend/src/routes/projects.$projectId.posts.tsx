import {
  Outlet,
  createFileRoute,
  useNavigate,
  useParams,
  useMatches,
} from "@tanstack/react-router";
import { PagesList } from "@/features/editor/PagesList";
import { useCreatePost, usePosts } from "@/features/editor/api";
import { genId, newPost, slugify } from "@/lib/project";

export const Route = createFileRoute("/projects/$projectId/posts")({
  component: PostsLayout,
});

function PostsLayout() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const posts = usePosts(projectId);
  const createPost = useCreatePost(projectId);
  const navigate = useNavigate();
  const matches = useMatches();
  const leaf = matches[matches.length - 1];
  const activePostId = (leaf?.params as { postId?: string } | undefined)?.postId;

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

  return (
    <div className="flex min-h-0 flex-1">
      <PagesList
        projectId={projectId}
        posts={posts.data ?? []}
        activePostId={activePostId}
        onNewPost={handleNewPost}
      />
      <Outlet />
    </div>
  );
}
