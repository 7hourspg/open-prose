import { useEffect } from "react";
import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";

export const LAST_ROUTE_KEY = "blogeditor.lastRoute";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/projects/")) {
      window.localStorage.setItem(LAST_ROUTE_KEY, pathname);
    }
  }, [pathname]);

  return <Outlet />;
}
