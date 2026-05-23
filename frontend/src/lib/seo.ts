export type SeoCheck = {
  id: string;
  label: string;
  pass: boolean;
  hint: string;
};

export type SeoReport = {
  score: number;
  checks: SeoCheck[];
};

export function analyzePost(p: {
  title: string;
  description: string;
  content: string;
  slug: string;
  tags: string[];
}): SeoReport {
  const title = p.title.trim();
  const desc = p.description.trim();
  const content = p.content;
  const headings = content.match(/^#{1,3}\s+.+$/gm) ?? [];
  const images = content.match(/!\[([^\]]*)\]\([^)]+\)/g) ?? [];
  const imagesMissingAlt = images.filter((m) => /^!\[\s*\]/.test(m)).length;

  const checks: SeoCheck[] = [
    {
      id: "title-len",
      label: "Title length 30–60 chars",
      pass: title.length >= 30 && title.length <= 60,
      hint:
        title.length < 30
          ? `Too short (${title.length}). Aim for 30–60.`
          : title.length > 60
          ? `Too long (${title.length}). Search engines truncate at ~60.`
          : `Good (${title.length}).`,
    },
    {
      id: "desc-len",
      label: "Description 70–160 chars",
      pass: desc.length >= 70 && desc.length <= 160,
      hint:
        desc.length === 0
          ? "Missing description. This is your SERP snippet."
          : desc.length < 70
          ? `Too short (${desc.length}). Add more context.`
          : desc.length > 160
          ? `Too long (${desc.length}). Will be truncated.`
          : `Good (${desc.length}).`,
    },
    {
      id: "slug",
      label: "Slug present and lowercase-kebab",
      pass: !!p.slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug),
      hint: p.slug
        ? "Looks good."
        : "Slug missing. Will be auto-generated from title on save.",
    },
    {
      id: "h1",
      label: "Has at least one H2 heading",
      pass: /^##\s+/m.test(content),
      hint: "Use ## headings to break up the article — helps scan-readers and SEO.",
    },
    {
      id: "len",
      label: "At least 300 words",
      pass: countWords(content) >= 300,
      hint: `Currently ${countWords(content)} words. Long-form ranks better.`,
    },
    {
      id: "img-alt",
      label: "All images have alt text",
      pass: images.length === 0 || imagesMissingAlt === 0,
      hint:
        images.length === 0
          ? "No images yet."
          : imagesMissingAlt === 0
          ? `${images.length} image(s), all have alt.`
          : `${imagesMissingAlt} image(s) missing alt text.`,
    },
    {
      id: "tags",
      label: "Has at least one tag",
      pass: p.tags.length > 0,
      hint:
        p.tags.length > 0
          ? `${p.tags.length} tag(s).`
          : "Tags help internal linking and topical clustering.",
    },
    {
      id: "keyword",
      label: "First H2 echoes a title word",
      pass: firstHeadingMatchesTitle(title, content),
      hint: "Reinforce the topic by reusing a key term in your first heading.",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

export function countWords(s: string) {
  return (s.trim().match(/\b\w+\b/g) ?? []).length;
}

export function readingMinutes(s: string) {
  return Math.max(1, Math.round(countWords(s) / 220));
}

function firstHeadingMatchesTitle(title: string, content: string) {
  const m = content.match(/^##\s+(.+)$/m);
  if (!m) return false;
  const titleWords = title
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const heading = m[1].toLowerCase();
  return titleWords.some((w) => heading.includes(w));
}
