import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePost,
  DeletePost,
  ExportProjectByID,
  ListPosts,
  PickExportDir,
  ReorderPosts,
  UpdatePost,
} from "../../../wailsjs/go/api/App";
import { domain } from "../../../wailsjs/go/models";
import { qk } from "@/lib/query-client";

export function usePosts(projectId: string | undefined) {
  return useQuery({
    queryKey: projectId ? qk.posts(projectId) : qk.posts("__none__"),
    queryFn: () => (projectId ? ListPosts(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useCreatePost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: domain.Post) => CreatePost(projectId, post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.posts(projectId) });
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}

export function useUpdatePost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: domain.Post) => UpdatePost(projectId, post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.posts(projectId) });
    },
  });
}

export function useReorderPosts(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postIds: string[]) => ReorderPosts(projectId, postIds),
    onMutate: async (postIds) => {
      await qc.cancelQueries({ queryKey: qk.posts(projectId) });
      const previous = qc.getQueryData<domain.Post[]>(qk.posts(projectId));
      if (previous) {
        const byId = new Map(previous.map((p) => [p.id, p]));
        const reordered = postIds
          .map((id) => byId.get(id))
          .filter((p): p is domain.Post => !!p);
        const remaining = previous.filter((p) => !postIds.includes(p.id));
        qc.setQueryData<domain.Post[]>(qk.posts(projectId), [
          ...reordered,
          ...remaining,
        ]);
      }
      return { previous };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(qk.posts(projectId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.posts(projectId) });
    },
  });
}

export function useDeletePost(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => DeletePost(projectId, postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.posts(projectId) });
      qc.invalidateQueries({ queryKey: qk.project(projectId) });
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}

export async function pickExportDir(defaultDir = "") {
  return PickExportDir(defaultDir);
}

export async function exportProject(req: domain.ExportRequest) {
  return ExportProjectByID(req);
}
