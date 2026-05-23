import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const qk = {
  projects: ["projects"] as const,
  project: (id: string) => ["project", id] as const,
  posts: (projectId: string) => ["posts", projectId] as const,
  post: (projectId: string, postId: string) =>
    ["post", projectId, postId] as const,
  templates: ["templates"] as const,
};
