package export

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"blog-editor/internal/domain"
	"blog-editor/internal/media"
)

type renderCtx struct {
	Slug                 string
	SiteNameJSON         string
	SiteURLJSON          string
	AuthorJSON           string
	DescriptionJSON      string
	IconJSON             string
	OgImageJSON          string
	LocaleJSON           string
	TwitterHandleJSON    string
	KeywordsJSON         string
	OrganizationNameJSON string
	OrganizationLogoJSON string
	SocialURLsJSON       string
	TemplateJSON         string
	HeaderTaglineJSON    string
	FooterCopyrightJSON  string
	SocialJSON           string
	NavigationJSON       string
	HasAbout             bool
	HasHome              bool
}

// ProjectOptions tweaks how Project assembles the exported site.
type ProjectOptions struct {
	// PostsOnly skips copying the base + theme template scaffold so user
	// customisations to layout.tsx / globals.css / package.json survive a
	// re-export. The site config file (src/lib/site.ts) is still rewritten
	// so changes to site name / URL / social flow through.
	PostsOnly bool
}

// Project assembles a Next.js project at outputDir/<site-slug> using the
// embedded templates. Returns the absolute project path on success.
func Project(outputDir string, p domain.Project, opts ProjectOptions) (string, error) {
	if err := validateTemplate(p.Theme.Template); err != nil {
		return "", err
	}
	if err := validatePostSlugs(p); err != nil {
		return "", err
	}

	projectName := Slugify(p.Site.Name)
	if projectName == "" {
		projectName = "blog"
	}
	projectDir := filepath.Join(outputDir, projectName)
	if err := os.MkdirAll(projectDir, 0o755); err != nil {
		return "", err
	}

	hasAbout := strings.TrimSpace(p.AboutContent) != ""
	hasHome := strings.TrimSpace(p.HomeContent) != ""
	ctx := buildRenderCtx(p, projectName, hasAbout, hasHome)

	if opts.PostsOnly {
		// Anchor the existence check on package.json — if it isn't there, the
		// target dir hasn't been exported into yet and there's nothing to
		// "preserve". Refuse rather than silently fall back to a full export.
		if _, err := os.Stat(filepath.Join(projectDir, "package.json")); err != nil {
			return "", fmt.Errorf("posts-only export requires an existing project at %s — run a full export first", projectDir)
		}
		// Refresh the site-config file so site name / URL / social changes flow through.
		if err := renderTemplateFile("templates/base/src/lib/site.ts.tmpl",
			filepath.Join(projectDir, "src", "lib", "site.ts"), ctx); err != nil {
			return "", fmt.Errorf("site config: %w", err)
		}
	} else {
		if err := copyTree("templates/base", projectDir, ctx); err != nil {
			return "", fmt.Errorf("base: %w", err)
		}
		if err := copyTree("templates/"+p.Theme.Template, projectDir, ctx); err != nil {
			return "", fmt.Errorf("template %s: %w", p.Theme.Template, err)
		}
	}

	postsDir := filepath.Join(projectDir, "content", "posts")
	if err := os.RemoveAll(postsDir); err != nil {
		return "", err
	}
	if err := os.MkdirAll(postsDir, 0o755); err != nil {
		return "", err
	}
	if err := writePosts(postsDir, p.Posts); err != nil {
		return "", fmt.Errorf("posts: %w", err)
	}

	if hasAbout {
		aboutPath := filepath.Join(projectDir, "content", "about.mdx")
		if err := os.MkdirAll(filepath.Dir(aboutPath), 0o755); err != nil {
			return "", err
		}
		if err := os.WriteFile(aboutPath, []byte(p.AboutContent), 0o644); err != nil {
			return "", err
		}
	}

	if strings.TrimSpace(p.HomeContent) != "" {
		homePath := filepath.Join(projectDir, "content", "home.mdx")
		if err := os.MkdirAll(filepath.Dir(homePath), 0o755); err != nil {
			return "", err
		}
		if err := os.WriteFile(homePath, []byte(p.HomeContent), 0o644); err != nil {
			return "", err
		}
	}

	mediaDest := filepath.Join(projectDir, "public", "media")
	if err := media.CopyTo(p.Meta.ID, mediaDest); err != nil {
		return "", fmt.Errorf("media: %w", err)
	}

	return projectDir, nil
}

func validateTemplate(id string) error {
	for _, t := range AvailableTemplates() {
		if t.ID == id {
			return nil
		}
	}
	return fmt.Errorf("unknown template: %s", id)
}

func validatePostSlugs(p domain.Project) error {
	seen := map[string]bool{}
	for _, post := range p.Posts {
		if post.Slug == "" {
			continue
		}
		if isDraft(post) {
			continue
		}
		if post.Slug == "about" {
			return fmt.Errorf("post slug %q is reserved by the About page", post.Slug)
		}
		if seen[post.Slug] {
			return fmt.Errorf("duplicate post slug %q", post.Slug)
		}
		seen[post.Slug] = true
	}
	return nil
}

func isDraft(p domain.Post) bool {
	return strings.EqualFold(strings.TrimSpace(p.Status), "draft")
}

func buildRenderCtx(p domain.Project, projectName string, hasAbout, hasHome bool) renderCtx {
	socialJSON, _ := json.Marshal(p.Footer.Social)
	if len(socialJSON) == 0 || string(socialJSON) == "null" {
		socialJSON = []byte("[]")
	}
	navJSON, _ := json.Marshal(p.Navigation)
	if len(navJSON) == 0 || string(navJSON) == "null" {
		navJSON = []byte("[]")
	}

	// Flat list of social URLs — fed to schema.org Organization.sameAs.
	socialURLs := make([]string, 0, len(p.Footer.Social))
	for _, s := range p.Footer.Social {
		if s.URL != "" {
			socialURLs = append(socialURLs, s.URL)
		}
	}
	socialURLsJSON, _ := json.Marshal(socialURLs)
	if len(socialURLsJSON) == 0 {
		socialURLsJSON = []byte("[]")
	}

	keywords := p.Site.Keywords
	if keywords == nil {
		keywords = []string{}
	}
	keywordsJSON, _ := json.Marshal(keywords)
	if len(keywordsJSON) == 0 {
		keywordsJSON = []byte("[]")
	}

	locale := strings.TrimSpace(p.Site.Locale)
	if locale == "" {
		locale = "en"
	}

	return renderCtx{
		Slug:                 projectName,
		SiteNameJSON:         jsonString(p.Site.Name),
		SiteURLJSON:          jsonString(strings.TrimRight(p.Site.URL, "/")),
		AuthorJSON:           jsonString(p.Site.Author),
		DescriptionJSON:      jsonString(p.Site.Description),
		IconJSON:             jsonString(p.Site.Icon),
		OgImageJSON:          jsonString(p.Site.OgImage),
		LocaleJSON:           jsonString(locale),
		TwitterHandleJSON:    jsonString(p.Site.TwitterHandle),
		KeywordsJSON:         string(keywordsJSON),
		OrganizationNameJSON: jsonString(p.Site.OrganizationName),
		OrganizationLogoJSON: jsonString(p.Site.OrganizationLogo),
		SocialURLsJSON:       string(socialURLsJSON),
		TemplateJSON:         jsonString(p.Theme.Template),
		HeaderTaglineJSON:    jsonString(p.Header.Tagline),
		FooterCopyrightJSON:  jsonString(p.Footer.Copyright),
		SocialJSON:           string(socialJSON),
		NavigationJSON:       string(navJSON),
		HasAbout:             hasAbout,
		HasHome:              hasHome,
	}
}

func copyTree(srcRoot, dstRoot string, ctx renderCtx) error {
	return fs.WalkDir(templateFS, srcRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(srcRoot, path)
		if err != nil {
			return err
		}
		if rel == "." {
			return nil
		}
		dstName := strings.TrimSuffix(rel, ".tmpl")
		dst := filepath.Join(dstRoot, dstName)

		if d.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}

		data, err := templateFS.ReadFile(path)
		if err != nil {
			return err
		}
		if strings.HasSuffix(rel, ".tmpl") {
			out, err := renderTemplate(rel, string(data), ctx)
			if err != nil {
				return err
			}
			data = []byte(out)
		}
		if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
			return err
		}
		return os.WriteFile(dst, data, 0o644)
	})
}

// renderTemplateFile reads a single .tmpl file from the embedded FS, runs it
// through text/template with the given context, and writes the result to dst
// (with the .tmpl suffix stripped from the destination path implicitly via
// the caller). The destination's parent dir is created if missing.
func renderTemplateFile(srcPath, dstPath string, ctx renderCtx) error {
	data, err := templateFS.ReadFile(srcPath)
	if err != nil {
		return err
	}
	out, err := renderTemplate(srcPath, string(data), ctx)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dstPath), 0o755); err != nil {
		return err
	}
	return os.WriteFile(dstPath, []byte(out), 0o644)
}

func renderTemplate(name, body string, ctx renderCtx) (string, error) {
	t, err := template.New(name).Parse(body)
	if err != nil {
		return "", err
	}
	var b strings.Builder
	if err := t.Execute(&b, ctx); err != nil {
		return "", err
	}
	return b.String(), nil
}

func writePosts(dir string, posts []domain.Post) error {
	for _, p := range posts {
		if isDraft(p) {
			continue
		}
		slug := p.Slug
		if slug == "" {
			slug = Slugify(p.Title)
		}
		published := p.CreatedAt
		if published.IsZero() {
			published = p.UpdatedAt
		}
		if published.IsZero() {
			published = time.Now()
		}
		updated := p.UpdatedAt
		if updated.IsZero() {
			updated = published
		}

		var b strings.Builder
		b.WriteString("---\n")
		fmt.Fprintf(&b, "title: %s\n", yamlString(p.Title))
		fmt.Fprintf(&b, "slug: %s\n", yamlString(slug))
		fmt.Fprintf(&b, "description: %s\n", yamlString(p.Description))
		// `date` retained for back-compat; equals publishedAt.
		fmt.Fprintf(&b, "date: %s\n", published.Format(time.RFC3339))
		fmt.Fprintf(&b, "publishedAt: %s\n", published.Format(time.RFC3339))
		fmt.Fprintf(&b, "updatedAt: %s\n", updated.Format(time.RFC3339))
		if len(p.Tags) > 0 {
			b.WriteString("tags:\n")
			for _, t := range p.Tags {
				fmt.Fprintf(&b, "  - %s\n", yamlString(t))
			}
		}
		if strings.TrimSpace(p.CoverImage) != "" {
			fmt.Fprintf(&b, "image: %s\n", yamlString(p.CoverImage))
		}
		if strings.TrimSpace(p.Author) != "" {
			fmt.Fprintf(&b, "author: %s\n", yamlString(p.Author))
		}
		if strings.TrimSpace(p.Canonical) != "" {
			fmt.Fprintf(&b, "canonical: %s\n", yamlString(p.Canonical))
		}
		if p.NoIndex {
			b.WriteString("noIndex: true\n")
		}
		b.WriteString("---\n\n")
		b.WriteString(p.Content)
		if !strings.HasSuffix(p.Content, "\n") {
			b.WriteString("\n")
		}
		if err := os.WriteFile(filepath.Join(dir, slug+".mdx"), []byte(b.String()), 0o644); err != nil {
			return err
		}
	}
	return nil
}

func jsonString(s string) string {
	b, err := json.Marshal(s)
	if err != nil {
		return `""`
	}
	return string(b)
}

func yamlString(s string) string {
	if s == "" {
		return `""`
	}
	if strings.ContainsAny(s, ":#&*!|>'\"%@`,[]{}") || strings.Contains(s, "\n") {
		b, _ := json.Marshal(s)
		return string(b)
	}
	return s
}
