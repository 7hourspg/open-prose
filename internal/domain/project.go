package domain

import "time"

type ProjectMeta struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Template   string    `json:"template"`
	PostCount  int       `json:"postCount"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
	LastOpened time.Time `json:"lastOpened"`
}

type Project struct {
	Meta            ProjectMeta  `json:"meta"`
	Site            SiteConfig   `json:"site"`
	Theme           Theme        `json:"theme"`
	Header          HeaderConfig `json:"header"`
	Footer          FooterConfig `json:"footer"`
	Navigation      []NavLink    `json:"navigation"`
	AboutContent    string       `json:"aboutContent"`
	HomeContent     string       `json:"homeContent"`
	HomeShowRecent  bool         `json:"homeShowRecent"`
	HomeRecentCount int          `json:"homeRecentCount"`
	Posts           []Post       `json:"posts"`
	Export          ExportPrefs  `json:"export"`
}

// ProjectConfig is the JSON-encoded blob stored in projects.config column.
type ProjectConfig struct {
	Site            SiteConfig   `json:"site"`
	Theme           Theme        `json:"theme"`
	Header          HeaderConfig `json:"header"`
	Footer          FooterConfig `json:"footer"`
	Navigation      []NavLink    `json:"navigation"`
	AboutContent    string       `json:"aboutContent"`
	HomeContent     string       `json:"homeContent"`
	HomeShowRecent  bool         `json:"homeShowRecent"`
	HomeRecentCount int          `json:"homeRecentCount"`
}

type SiteConfig struct {
	Name             string   `json:"name"`
	URL              string   `json:"url"`
	Author           string   `json:"author"`
	Description      string   `json:"description"`
	Icon             string   `json:"icon"`             // /media/<file>; favicon for the exported site
	OgImage          string   `json:"ogImage"`          // /media/<file>; default OpenGraph image
	Locale           string   `json:"locale"`           // BCP-47, e.g. "en", "fr-FR"; <html lang> + og:locale
	TwitterHandle    string   `json:"twitterHandle"`    // "@handle"; twitter:site / twitter:creator
	Keywords         []string `json:"keywords"`         // site-wide keywords
	OrganizationName string   `json:"organizationName"` // schema.org Organization.name; falls back to Name
	OrganizationLogo string   `json:"organizationLogo"` // /media/<file>; falls back to Icon
}

type Theme struct {
	Template string `json:"template"`
}

type HeaderConfig struct {
	Tagline string `json:"tagline"`
}

type FooterConfig struct {
	Copyright string       `json:"copyright"`
	Social    []SocialLink `json:"social"`
}

type SocialLink struct {
	Platform string `json:"platform"`
	URL      string `json:"url"`
}

type NavLink struct {
	Label string `json:"label"`
	Href  string `json:"href"`
}

type Post struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	Tags        []string  `json:"tags"`
	CoverImage  string    `json:"coverImage"` // /media/<file>; per-post OG image / Article schema image
	Author      string    `json:"author"`     // optional override of site.author
	Canonical   string    `json:"canonical"`  // optional external canonical URL
	NoIndex     bool      `json:"noIndex"`    // emit robots: noindex, nofollow
	Status      string    `json:"status"`     // "draft" | "published"; drafts are excluded from export
	Position    int64     `json:"position"`   // sidebar ordering; higher = newer/manually moved up
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ExportPrefs struct {
	LastOutputDir string `json:"lastOutputDir"`
}

type TemplateInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Accent      string `json:"accent"`
}

type ExportRequest struct {
	ProjectID string `json:"projectId"`
	OutputDir string `json:"outputDir"`
	// PostsOnly skips overwriting template/scaffold files; only post MDX,
	// about/home content, media, and site config are refreshed. Lets users
	// preserve customisations to layout.tsx / globals.css / package.json
	// across re-exports.
	PostsOnly bool `json:"postsOnly,omitempty"`
}

type ExportResult struct {
	OK      bool   `json:"ok"`
	Path    string `json:"path"`
	Posts   int    `json:"posts"`
	Message string `json:"message"`
}
