import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { OpenURL } from "../../wailsjs/go/api/App";

export const Route = createFileRoute("/projects/$projectId/help")({
  component: HelpRoute,
});

function HelpRoute() {
  return (
    <div
      className="flex flex-1 flex-col items-center gap-7 overflow-y-auto px-12 pb-24 pt-9 max-[1100px]:px-7 max-[1100px]:pt-7"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-[720px]">
        <h1
          className="m-0 mb-1.5 text-[30px] font-semibold tracking-tight"
          style={{
            fontFamily: "var(--font-serif-stack)",
            color: "var(--ink)",
          }}
        >
          Build & deploy
        </h1>
        <p
          className="m-0 mb-7 max-w-[56ch] text-[13.5px]"
          style={{ color: "var(--ink-3)" }}
        >
          What to do after you click <b>Export</b>. The exported folder is a
          self-contained Next.js project — yours to host anywhere.
        </p>

        <Card title="What you exported">
          <p>
            The folder contains a complete Next.js + MDX project: your posts as
            MDX files, the chosen template's pages and styles, an RSS feed,
            sitemap, robots, and a <code>package.json</code> with every
            dependency pinned.
          </p>
          <Tree
            items={[
              { label: "content/posts/*.mdx", note: "your posts" },
              { label: "content/about.mdx", note: "the About page" },
              { label: "src/lib/site.ts", note: "site config (name, URL, nav, social)" },
              { label: "src/app/", note: "Next.js routes" },
              { label: "package.json", note: "deps + scripts" },
            ]}
          />
        </Card>

        <Card title="Run it on your computer">
          <p>
            Click <b>Run locally</b> on the Export panel — Open Prose installs
            dependencies (first run only) and starts the dev server at{" "}
            <Code>localhost:3000</Code>. Your default browser opens
            automatically.
          </p>
          <p className="mt-2">
            The dev server keeps running in the background. The status bar at
            the bottom of every screen shows <Mark>● localhost:3000</Mark> with
            quick-stop and open buttons.
          </p>
          <p className="mt-2" style={{ color: "var(--ink-3)" }}>
            Doing it manually instead? In a terminal, <Code>cd</Code> into the
            exported folder and run:
          </p>
          <Pre>npm install
npm run dev</Pre>
        </Card>

        <Card title="Deploy to Vercel">
          <p>
            Vercel is the fastest path online for a Next.js site — free hobby
            tier, automatic SSL, push-button custom domains. Click{" "}
            <b>Deploy to Vercel</b> on the Export panel and:
          </p>
          <ol className="mt-2 list-decimal pl-5">
            <li>First run opens your browser to log in (Google/GitHub work).</li>
            <li>The CLI builds the project and pushes it.</li>
            <li>You get back a <Code>https://&lt;site&gt;.vercel.app</Code> URL.</li>
          </ol>
          <p className="mt-2">
            Re-deploys are instant — same flow, no auth needed. The URL stays
            the same; immutable preview URLs are also generated per build.
          </p>
          <p className="mt-2" style={{ color: "var(--ink-3)" }}>
            Doing it manually? Inside the exported folder:
          </p>
          <Pre>npx vercel --prod</Pre>
          <button
            type="button"
            onClick={() => OpenURL("https://vercel.com/signup")}
            className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md border-0 px-2.5 text-[12px] font-medium"
            style={{
              background: "color-mix(in oklab, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Icon name="rocket" size={11} /> Sign up for Vercel
          </button>
        </Card>

        <Card title="Custom domain">
          <p>
            Once your blog is live on Vercel, point your own domain at it:
          </p>
          <ol className="mt-2 list-decimal pl-5">
            <li>Vercel dashboard → your project → <b>Settings</b> → <b>Domains</b>.</li>
            <li>Add the domain and follow the DNS instructions Vercel shows.</li>
            <li>SSL is auto-issued within a minute.</li>
          </ol>
        </Card>

        <Card title="Other hosts">
          <p>The exported project is plain Next.js — any host that runs Node works.</p>
          <Host
            name="Netlify"
            cmd="npx netlify-cli deploy --prod"
            note="Same vibe as Vercel. Free tier."
          />
          <Host
            name="Cloudflare Pages"
            cmd="npx wrangler pages deploy out"
            note="Build first with `npm run build && next export` (config tweak)."
          />
          <Host
            name="GitHub Pages"
            cmd="—"
            note="Static-only. Add `output: 'export'` to next.config.mjs first."
          />
        </Card>

        <Card title="Troubleshooting">
          <Trouble q="Node not detected">
            Open Prose calls Node + npm to build and deploy. Install Node from{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                OpenURL("https://nodejs.org/en/download");
              }}
              style={{ color: "var(--accent)" }}
            >
              nodejs.org
            </a>
            . Restart the app after installing.
          </Trouble>
          <Trouble q="Port 3000 already in use">
            Next.js falls back to 3001, 3002, etc. The status bar reflects the
            real port. To free 3000, stop whatever else is running there
            (often a stale dev server from another project).
          </Trouble>
          <Trouble q="Vercel auth failed / canceled">
            Re-click <b>Deploy to Vercel</b>. The browser will reopen. If it
            keeps failing, run <Code>npx vercel logout</Code> in a terminal
            and try again.
          </Trouble>
          <Trouble q="Build error during deploy">
            The log panel shows the full output. Most common: a typo in MDX
            content. Fix it in Open Prose, re-export, redeploy.
          </Trouble>
          <Trouble q="No vercel.app URL printed">
            Rare — usually means deploy succeeded but our regex missed the
            URL. Check the Vercel dashboard; the project will be there.
          </Trouble>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        marginBottom: 18,
        border: "0.5px solid var(--hairline)",
        background: "color-mix(in oklab, var(--canvas) 92%, var(--panel))",
      }}
    >
      <div
        className="flex items-center gap-2.5 pb-2.5 pt-3"
        style={{
          paddingLeft: 18,
          paddingRight: 18,
          borderBottom: "0.5px solid var(--hairline)",
        }}
      >
        <h3 className="m-0 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
          {title}
        </h3>
      </div>
      <div
        className="px-[18px] py-3.5 text-[13.5px] leading-[1.6]"
        style={{ color: "var(--ink-2)" }}
      >
        {children}
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="rounded px-1.5 py-0.5 text-[12.5px]"
      style={{
        background: "color-mix(in oklab, var(--ink) 8%, transparent)",
        color: "var(--ink)",
        fontFamily: "var(--font-mono-stack)",
      }}
    >
      {children}
    </code>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11.5px] font-medium"
      style={{
        background: "color-mix(in oklab, #2bbb6e 18%, transparent)",
        color: "#1a8a4f",
        fontFamily: "var(--font-mono-stack)",
      }}
    >
      {children}
    </span>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre
      className="my-2 overflow-x-auto rounded-md p-3 text-[12.5px] leading-[1.55]"
      style={{
        background: "color-mix(in oklab, var(--ink) 7%, transparent)",
        color: "var(--ink)",
        fontFamily: "var(--font-mono-stack)",
      }}
    >
      {children}
    </pre>
  );
}

function Tree({ items }: { items: { label: string; note: string }[] }) {
  return (
    <ul
      className="mt-3 list-none p-0"
      style={{
        fontFamily: "var(--font-mono-stack)",
        fontSize: 12.5,
        color: "var(--ink-2)",
      }}
    >
      {items.map((it) => (
        <li key={it.label} className="flex items-baseline gap-3 py-0.5">
          <span style={{ color: "var(--ink)" }}>{it.label}</span>
          <span style={{ color: "var(--ink-4)", fontSize: 11.5 }}>
            — {it.note}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Host({
  name,
  cmd,
  note,
}: {
  name: string;
  cmd: string;
  note: string;
}) {
  return (
    <div
      className="mt-2 flex flex-col gap-1 rounded-md p-2.5"
      style={{
        border: "0.5px solid var(--hairline)",
        background: "var(--canvas)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
          {name}
        </span>
        {cmd !== "—" && <Code>{cmd}</Code>}
      </div>
      <div className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>
        {note}
      </div>
    </div>
  );
}

function Trouble({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5">
      <div className="text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
        {q}
      </div>
      <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
        {children}
      </div>
    </div>
  );
}
