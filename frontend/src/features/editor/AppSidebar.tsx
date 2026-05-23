import type { ReactNode } from "react";
import {
  Link,
  useMatches,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { domain } from "../../../wailsjs/go/models";

type Section = "home" | "posts" | "about" | "site";

type Props = {
  projectId: string;
  project: domain.Project;
  postCount: number;
  onOpenExport: () => void;
};

export function AppSidebar({ projectId, project, postCount, onOpenExport }: Props) {
  const matches = useMatches();
  const path = matches[matches.length - 1]?.pathname ?? "";
  const hash = useRouterState({ select: (s) => s.location.hash || "" });
  const active: Section | null = (() => {
    if (path.endsWith("/home")) return "home";
    if (path.endsWith("/about")) return "about";
    if (path.endsWith("/site")) return "site";
    if (path.includes("/posts")) return "posts";
    return null;
  })();
  const onSite = active === "site";
  // Default sub-section is "identity" when no hash is set.
  const currentHash = onSite ? hash || "identity" : "";

  return (
    <div
      className="flex w-[248px] min-h-0 flex-none flex-col max-[1100px]:w-[200px] max-[820px]:w-[56px]"
      style={{
        borderRight: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--panel) 70%, var(--bg))",
      }}
    >
      <SidebarSection title="Content">
        <NavItem
          to="/projects/$projectId/home"
          params={{ projectId }}
          icon="home"
          label="Home"
          tag="page"
          isActive={active === "home"}
        />
        <NavItem
          to="/projects/$projectId/posts"
          params={{ projectId }}
          icon="pages"
          label="Posts"
          count={postCount}
          isActive={active === "posts"}
        />
        <NavItem
          to="/projects/$projectId/about"
          params={{ projectId }}
          icon="site"
          label="About"
          tag="page"
          isActive={active === "about"}
        />
      </SidebarSection>

      <SidebarSection title="Site">
        <NavItem
          to="/projects/$projectId/site"
          params={{ projectId }}
          icon="site"
          label="Identity"
          isActive={onSite && currentHash === "identity"}
        />
        <NavItem
          to="/projects/$projectId/site"
          params={{ projectId }}
          hash="navigation"
          icon="nav"
          label="Navigation"
          isActive={onSite && currentHash === "navigation"}
        />
        <NavItem
          to="/projects/$projectId/site"
          params={{ projectId }}
          hash="template"
          icon="template"
          label="Template"
          isActive={onSite && currentHash === "template"}
        />
      </SidebarSection>

      <SidebarSection title="Build">
        <NavItem
          to="/projects/$projectId/help"
          params={{ projectId }}
          icon="about"
          label="Deploy guide"
          isActive={path.endsWith("/help")}
        />
        <button
          type="button"
          onClick={onOpenExport}
          className={navItemClass()}
          style={navItemStyle(false)}
        >
          <Icon name="export" />
          <span className="min-w-0 flex-1 truncate max-[820px]:hidden">Export…</span>
        </button>
      </SidebarSection>

      <div className="flex-1" />

      <SiteCard project={project} />
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-2.5">
      <h4
        className="mb-1 mt-0 px-2 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[.07em] max-[820px]:hidden"
        style={{ color: "var(--ink-4)" }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function navItemClass() {
  return [
    "w-full flex items-center gap-2.5 px-2.5 rounded-[7px] border-0 text-left whitespace-nowrap overflow-hidden",
    "max-[820px]:px-0 max-[820px]:justify-center",
    "hover:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]",
  ].join(" ");
}

function navItemStyle(isActive: boolean): React.CSSProperties {
  return {
    height: 28,
    background: isActive
      ? "color-mix(in oklab, var(--accent) 8%, transparent)"
      : "transparent",
    color: isActive ? "var(--accent)" : "var(--ink-2)",
    fontSize: 13,
    fontWeight: 500,
  };
}

function NavItem({
  to,
  params,
  hash,
  icon,
  label,
  count,
  tag,
  isActive,
}: {
  to: string;
  params: Record<string, string>;
  hash?: string;
  icon: IconName;
  label: string;
  count?: number;
  tag?: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      hash={hash}
      className={navItemClass()}
      style={navItemStyle(isActive)}
    >
      <Icon name={icon} className="flex-none opacity-90" />
      <span className="min-w-0 flex-1 truncate max-[820px]:hidden">{label}</span>
      {typeof count === "number" && (
        <span
          className="ml-auto rounded-full px-1.5 py-px text-[11px] tabular-nums max-[820px]:hidden"
          style={{
            color: isActive ? "var(--accent)" : "var(--ink-4)",
            fontWeight: 500,
            background: isActive
              ? "color-mix(in oklab, var(--accent) 16%, transparent)"
              : "color-mix(in oklab, var(--ink) 6%, transparent)",
          }}
        >
          {count}
        </span>
      )}
      {tag && (
        <span
          className="ml-auto flex-none text-[10px] font-semibold uppercase tracking-[.06em] max-[820px]:hidden"
          style={{ color: "var(--ink-4)" }}
        >
          {tag}
        </span>
      )}
    </Link>
  );
}

function SiteCard({ project }: { project: domain.Project }) {
  const navigate = useNavigate();
  const initial = (project.site?.name || project.meta?.name || "?").slice(0, 1);
  const url = (project.site?.url || "").replace(/^https?:\/\//, "") || "—";
  return (
    <Button
      variant="ghost"
      title="Switch site or create a new one"
      onClick={() => navigate({ to: "/" })}
      className="m-2.5 h-auto w-[calc(100%-1.25rem)] justify-start gap-2.5 px-3 py-2.5 text-left hover:brightness-[.97] max-[820px]:m-2 max-[820px]:w-[calc(100%-1rem)] max-[820px]:justify-center max-[820px]:p-2"
      style={{
        border: "0.5px solid var(--hairline)",
        borderRadius: 9,
        background: "color-mix(in oklab, var(--panel) 92%, transparent)",
      }}
    >
      <div
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-[13px] font-bold text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 60%, black) 100%)",
          fontFamily: "var(--font-serif-stack)",
          boxShadow: "0 0 0 0.5px rgba(0,0,0,.18) inset",
        }}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1 max-[820px]:hidden">
        <div
          className="truncate text-[12.5px] font-semibold leading-tight"
          style={{ color: "var(--ink)" }}
        >
          {project.site?.name || project.meta?.name}
        </div>
        <div
          className="mt-0.5 truncate text-[11px] tabular-nums"
          style={{ color: "var(--ink-3)" }}
        >
          {url}
        </div>
      </div>
      <span
        className="flex-none max-[820px]:hidden"
        style={{ color: "var(--ink-4)" }}
      >
        <Icon name="chevdown" size={13} />
      </span>
    </Button>
  );
}
