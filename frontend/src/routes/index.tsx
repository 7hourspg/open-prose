import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { ProjectsList } from "@/features/projects/ProjectsList";
import { FIRST_RUN_FLAG } from "@/features/onboarding/api";
import { LAST_ROUTE_KEY } from "@/routes/__root";
import { GetSetting, ListPosts, ListProjects } from "../../wailsjs/go/api/App";

const RESUMED_KEY = "blogeditor.resumedThisSession";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;

    let projectCount = 0;
    let firstRunCompleted = false;
    try {
      projectCount = (await ListProjects()).length;
      firstRunCompleted = (await GetSetting(FIRST_RUN_FLAG)) === "1";
    } catch {
      // API failed; fall through to empty state below.
    }

    if (projectCount === 0 && !firstRunCompleted) {
      throw redirect({ to: "/welcome" });
    }

    if (window.sessionStorage.getItem(RESUMED_KEY)) return;
    window.sessionStorage.setItem(RESUMED_KEY, "1");
    const last = window.localStorage.getItem(LAST_ROUTE_KEY);
    if (!last) return;

    const m = last.match(/^\/projects\/([^/]+)(?:\/(.*))?$/);
    if (!m) {
      window.localStorage.removeItem(LAST_ROUTE_KEY);
      return;
    }
    const [, projectId, rest = ""] = m;

    let projects;
    try {
      projects = await ListProjects();
    } catch {
      return;
    }
    if (!projects.some((p) => p.id === projectId)) {
      window.localStorage.removeItem(LAST_ROUTE_KEY);
      return;
    }

    const postMatch = rest.match(/^posts\/([^/]+)$/);
    if (postMatch) {
      try {
        const posts = await ListPosts(projectId);
        if (!posts.some((p) => p.id === postMatch[1])) {
          throw redirect({
            to: "/projects/$projectId/posts",
            params: { projectId },
          });
        }
      } catch (err) {
        if (isRedirect(err)) throw err;
        // ListPosts failed — fall through to projects list root.
        throw redirect({
          to: "/projects/$projectId/posts",
          params: { projectId },
        });
      }
    }

    throw redirect({ to: last });
  },
  component: ProjectsList,
});
