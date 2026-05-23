import { createFileRoute, useParams } from "@tanstack/react-router";
import { DocEditor } from "@/features/editor/DocEditor";

export const Route = createFileRoute("/projects/$projectId/posts/$postId")({
  component: PostRoute,
});

function PostRoute() {
  const { projectId, postId } = useParams({ strict: false }) as {
    projectId: string;
    postId: string;
  };
  return <DocEditor projectId={projectId} postId={postId} />;
}
