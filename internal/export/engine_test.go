package export

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"blog-editor/internal/domain"
)

func sampleProject(name, template string) domain.Project {
	now := time.Now()
	return domain.Project{
		Meta: domain.ProjectMeta{
			ID:         "p_test",
			Name:       name,
			Template:   template,
			CreatedAt:  now,
			UpdatedAt:  now,
			LastOpened: now,
		},
		Site: domain.SiteConfig{
			Name:        name,
			URL:         "https://example.com",
			Author:      "Rajiv",
			Description: "A test site.",
		},
		Theme:  domain.Theme{Template: template},
		Header: domain.HeaderConfig{Tagline: "thoughts in transit"},
		Footer: domain.FooterConfig{
			Copyright: "© Rajiv",
			Social:    []domain.SocialLink{{Platform: "twitter", URL: "https://x.com/rajiv"}},
		},
		Navigation:   []domain.NavLink{{Label: "About", Href: "/about"}},
		AboutContent: "# About\n\nThis is the about page body in MDX.\n",
		Posts: []domain.Post{
			{
				ID:          "p_1",
				Title:       "Welcome to my blog",
				Slug:        "welcome-to-my-blog",
				Description: "An introductory post that proves the export engine round-trips frontmatter and Markdown body correctly.",
				Content:     "## What this is\n\nA quick **hello** with a [link](https://example.com).\n",
				Tags:        []string{"intro"},
				CreatedAt:   now,
				UpdatedAt:   now,
			},
		},
	}
}

func TestExportAllTemplates(t *testing.T) {
	tmp := t.TempDir()
	for _, tpl := range []string{"minimal", "magazine", "developer", "notebook", "noir", "newsletter"} {
		t.Run(tpl, func(t *testing.T) {
			p := sampleProject("Hello "+tpl, tpl)
			path, err := Project(tmp, p, ProjectOptions{})
			if err != nil {
				t.Fatal(err)
			}
			must := []string{
				"package.json",
				"tsconfig.json",
				"next.config.mjs",
				"postcss.config.mjs",
				"src/lib/site.ts",
				"src/lib/content.ts",
				"src/app/layout.tsx",
				"src/app/page.tsx",
				"src/app/blog/page.tsx",
				"src/app/blog/[slug]/page.tsx",
				"src/app/about/page.tsx",
				"src/app/sitemap.ts",
				"src/app/robots.ts",
				"src/app/feed.xml/route.ts",
				"src/styles/globals.css",
				"content/posts/welcome-to-my-blog.mdx",
				"content/about.mdx",
			}
			for _, f := range must {
				if _, err := os.Stat(filepath.Join(path, f)); err != nil {
					t.Errorf("missing %s: %v", f, err)
				}
			}
			b, err := os.ReadFile(filepath.Join(path, "src/lib/site.ts"))
			if err != nil {
				t.Fatal(err)
			}
			body := string(b)
			if !strings.Contains(body, `name: "Hello `+tpl+`"`) {
				t.Errorf("site.ts missing site name. got: %s", body)
			}
		})
	}
}

func TestExportSkipsAboutWhenEmpty(t *testing.T) {
	tmp := t.TempDir()
	p := sampleProject("No About", "minimal")
	p.AboutContent = ""
	path, err := Project(tmp, p, ProjectOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(path, "content/about.mdx")); !os.IsNotExist(err) {
		t.Errorf("expected about.mdx to be absent when AboutContent is empty, got: %v", err)
	}
}

func TestExportToFixedDir(t *testing.T) {
	out := os.Getenv("EXPORT_TEST_DIR")
	if out == "" {
		t.Skip("set EXPORT_TEST_DIR to run")
	}
	tpl := os.Getenv("EXPORT_TEST_TEMPLATE")
	if tpl == "" {
		tpl = "minimal"
	}
	p := sampleProject("Demo Blog", tpl)
	path, err := Project(out, p, ProjectOptions{})
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("exported to %s", path)
}

func TestExportSkipsDraftPosts(t *testing.T) {
	tmp := t.TempDir()
	p := sampleProject("Drafts", "minimal")
	now := time.Now()
	p.Posts = append(p.Posts, domain.Post{
		ID:        "p_draft",
		Title:     "WIP",
		Slug:      "wip",
		Content:   "draft body",
		Status:    "draft",
		CreatedAt: now,
		UpdatedAt: now,
	})
	path, err := Project(tmp, p, ProjectOptions{})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(path, "content/posts/wip.mdx")); !os.IsNotExist(err) {
		t.Errorf("draft mdx should be skipped, got: %v", err)
	}
	if _, err := os.Stat(filepath.Join(path, "content/posts/welcome-to-my-blog.mdx")); err != nil {
		t.Errorf("published post should still export: %v", err)
	}
}

func TestExportPostSlugReservedAbout(t *testing.T) {
	tmp := t.TempDir()
	p := sampleProject("Reserved", "minimal")
	p.Posts[0].Slug = "about"
	_, err := Project(tmp, p, ProjectOptions{})
	if err == nil || !strings.Contains(err.Error(), "reserved") {
		t.Fatalf("expected reserved-slug error, got %v", err)
	}
}

func TestExportPostsOnlyPreservesCustomCode(t *testing.T) {
	tmp := t.TempDir()
	p := sampleProject("Preserve Me", "minimal")

	// First, a full export.
	path, err := Project(tmp, p, ProjectOptions{})
	if err != nil {
		t.Fatalf("initial full export: %v", err)
	}

	// Simulate user customisation of the exported template files.
	custom := map[string]string{
		"src/styles/globals.css": "/* MY CUSTOM TWEAK */",
		"src/app/layout.tsx":     "// hand-edited layout",
		"package.json":           `{"name":"manually-edited"}`,
	}
	for rel, marker := range custom {
		full := filepath.Join(path, rel)
		existing, err := os.ReadFile(full)
		if err != nil {
			t.Fatalf("read %s: %v", rel, err)
		}
		if err := os.WriteFile(full, append(existing, []byte("\n"+marker+"\n")...), 0o644); err != nil {
			t.Fatalf("append marker to %s: %v", rel, err)
		}
	}

	// Add a new post and update site description (not name — name affects slug
	// and would land in a different output dir on the second export).
	now := time.Now()
	p.Posts = append(p.Posts, domain.Post{
		ID:        "p_new",
		Title:     "Second post",
		Slug:      "second-post",
		Content:   "fresh body",
		Status:    "published",
		CreatedAt: now,
		UpdatedAt: now,
	})
	p.Site.Description = "An updated tagline for the site"

	path2, err := Project(tmp, p, ProjectOptions{PostsOnly: true})
	if err != nil {
		t.Fatalf("posts-only re-export: %v", err)
	}
	if path2 != path {
		t.Errorf("expected same project dir, got %q vs %q", path2, path)
	}

	// Custom edits must survive.
	for rel, marker := range custom {
		body, err := os.ReadFile(filepath.Join(path, rel))
		if err != nil {
			t.Fatalf("re-read %s: %v", rel, err)
		}
		if !strings.Contains(string(body), marker) {
			t.Errorf("custom marker missing from %s after posts-only export", rel)
		}
	}

	// New post must be there.
	if _, err := os.Stat(filepath.Join(path, "content/posts/second-post.mdx")); err != nil {
		t.Errorf("new post missing after posts-only export: %v", err)
	}

	// Site config must reflect the description update.
	site, err := os.ReadFile(filepath.Join(path, "src/lib/site.ts"))
	if err != nil {
		t.Fatalf("read site.ts: %v", err)
	}
	if !strings.Contains(string(site), `An updated tagline for the site`) {
		t.Errorf("site.ts not updated with new description; got: %s", site)
	}
}

func TestExportPostsOnlyRequiresExistingProject(t *testing.T) {
	tmp := t.TempDir()
	p := sampleProject("No Existing", "minimal")
	_, err := Project(tmp, p, ProjectOptions{PostsOnly: true})
	if err == nil {
		t.Fatal("expected posts-only export to refuse an empty target dir")
	}
	if !strings.Contains(err.Error(), "posts-only export requires an existing project") {
		t.Errorf("unexpected error message: %v", err)
	}
}
