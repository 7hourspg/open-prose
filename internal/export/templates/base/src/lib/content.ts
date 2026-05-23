import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  content: string;
  coverImage: string;
  author: string;
  canonical: string;
  noIndex: boolean;
};

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const ABOUT_FILE = path.join(process.cwd(), "content", "about.mdx");
const HOME_FILE = path.join(process.cwd(), "content", "home.mdx");

function normalizeDate(d: unknown): string {
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return new Date().toISOString();
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const published = normalizeDate(data.publishedAt ?? data.date);
      const updated = normalizeDate(data.updatedAt ?? data.publishedAt ?? data.date);
      return {
        slug: data.slug ?? file.replace(/\.mdx$/, ""),
        title: data.title ?? "Untitled",
        description: data.description ?? "",
        date: published,
        publishedAt: published,
        updatedAt: updated,
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
        coverImage: typeof data.image === "string" ? data.image : "",
        author: typeof data.author === "string" ? data.author : "",
        canonical: typeof data.canonical === "string" ? data.canonical : "",
        noIndex: data.noIndex === true,
      } as Post;
    });
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** Most-recent posts, capped at `n` (default 3). Used by the home page. */
export function getRecentPosts(n = 3): Post[] {
  return getAllPosts().slice(0, n);
}

/** Returns the previous (older) and next (newer) post around `slug`,
 *  or `null` for either side if it's the first/last post. */
export function getAdjacentPosts(slug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const all = getAllPosts(); // newest → oldest
  const i = all.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    next: i > 0 ? all[i - 1] : null, // newer (earlier in array)
    prev: i < all.length - 1 ? all[i + 1] : null, // older
  };
}

export function getAboutMDX(): string | null {
  if (!fs.existsSync(ABOUT_FILE)) return null;
  return fs.readFileSync(ABOUT_FILE, "utf8");
}

export function getHomeMDX(): string | null {
  if (!fs.existsSync(HOME_FILE)) return null;
  return fs.readFileSync(HOME_FILE, "utf8");
}
