package service

import (
	"fmt"
	"strings"
	"time"

	"blog-editor/internal/domain"
	"blog-editor/internal/export"
	"blog-editor/internal/repository"
)

type ProjectService struct {
	projects repository.ProjectRepository
	posts    repository.PostRepository
}

func NewProjectService(
	projects repository.ProjectRepository,
	posts repository.PostRepository,
) *ProjectService {
	return &ProjectService{projects: projects, posts: posts}
}

func (s *ProjectService) List() ([]domain.ProjectMeta, error) {
	return s.projects.List()
}

func (s *ProjectService) Open(id string) (domain.Project, error) {
	p, err := s.projects.Get(id)
	if err != nil {
		return domain.Project{}, err
	}
	posts, err := s.posts.ListByProject(id)
	if err != nil {
		return domain.Project{}, err
	}
	p.Posts = posts
	if err := s.projects.UpdateLastOpened(id); err != nil {
		return domain.Project{}, err
	}
	p.Meta.LastOpened = time.Now()
	p.Meta.PostCount = len(posts)
	return p, nil
}

func (s *ProjectService) Create(name, template string) (domain.ProjectMeta, error) {
	if name == "" {
		name = "Untitled site"
	}
	if template == "" {
		template = "minimal"
	}
	p := newDefaultProject(name, template)
	if err := s.projects.Create(p); err != nil {
		return domain.ProjectMeta{}, err
	}
	return p.Meta, nil
}

func (s *ProjectService) Save(p domain.Project) error {
	if p.Meta.ID == "" {
		return fmt.Errorf("project has no id")
	}
	name := strings.TrimSpace(p.Site.Name)
	if name == "" {
		name = p.Meta.Name
	}
	cfg := domain.ProjectConfig{
		Site:            p.Site,
		Theme:           p.Theme,
		Header:          p.Header,
		Footer:          p.Footer,
		Navigation:      p.Navigation,
		AboutContent:    p.AboutContent,
		HomeContent:     p.HomeContent,
		HomeShowRecent:  p.HomeShowRecent,
		HomeRecentCount: p.HomeRecentCount,
	}
	return s.projects.UpdateConfig(p.Meta.ID, name, p.Theme.Template, cfg, p.Export.LastOutputDir)
}

func (s *ProjectService) Rename(id, name string) error {
	return s.projects.Rename(id, name)
}

func (s *ProjectService) Delete(id string) error {
	return s.projects.Delete(id)
}

func (s *ProjectService) Duplicate(id string) (domain.ProjectMeta, error) {
	src, err := s.Open(id)
	if err != nil {
		return domain.ProjectMeta{}, err
	}
	now := time.Now()
	src.Meta.ID = fmt.Sprintf("p_%d", now.UnixNano())
	src.Meta.Name = src.Meta.Name + " (copy)"
	src.Meta.CreatedAt = now
	src.Meta.UpdatedAt = now
	src.Meta.LastOpened = now
	if err := s.projects.Create(src); err != nil {
		return domain.ProjectMeta{}, err
	}
	for _, post := range src.Posts {
		post.ID = fmt.Sprintf("post_%d_%s", now.UnixNano(), post.Slug)
		if err := s.posts.Create(src.Meta.ID, post); err != nil {
			return domain.ProjectMeta{}, err
		}
	}
	src.Meta.PostCount = len(src.Posts)
	return src.Meta, nil
}

// --- Posts ---------------------------------------------------------------

func (s *ProjectService) ListPosts(projectID string) ([]domain.Post, error) {
	return s.posts.ListByProject(projectID)
}

func (s *ProjectService) CreatePost(projectID string, p domain.Post) (domain.Post, error) {
	now := time.Now()
	if p.ID == "" {
		p.ID = fmt.Sprintf("post_%d", now.UnixNano())
	}
	if strings.TrimSpace(p.Slug) == "" {
		p.Slug = export.Slugify(p.Title)
	}
	if p.CreatedAt.IsZero() {
		p.CreatedAt = now
	}
	p.UpdatedAt = now
	if p.Slug != "" {
		unique, err := s.nextAvailableSlug(projectID, p.Slug)
		if err != nil {
			return domain.Post{}, err
		}
		p.Slug = unique
	}
	if err := s.assertSlugFree(projectID, "", p.Slug); err != nil {
		return domain.Post{}, err
	}
	if err := s.posts.Create(projectID, p); err != nil {
		return domain.Post{}, err
	}
	return p, nil
}

func (s *ProjectService) UpdatePost(projectID string, p domain.Post) (domain.Post, error) {
	if p.ID == "" {
		return domain.Post{}, fmt.Errorf("post has no id")
	}
	if strings.TrimSpace(p.Slug) == "" {
		p.Slug = export.Slugify(p.Title)
	}
	p.UpdatedAt = time.Now()
	if err := s.assertSlugFree(projectID, p.ID, p.Slug); err != nil {
		return domain.Post{}, err
	}
	if err := s.posts.Update(projectID, p); err != nil {
		return domain.Post{}, err
	}
	return p, nil
}

func (s *ProjectService) DeletePost(projectID, postID string) error {
	return s.posts.Delete(projectID, postID)
}

func (s *ProjectService) ReorderPosts(projectID string, postIDs []string) error {
	return s.posts.Reorder(projectID, postIDs)
}

// nextAvailableSlug returns base if no other post in the project uses it, or
// base-N for the smallest N>=2 that isn't taken. The "about" reservation is
// respected. Used on Create only — Update keeps assertSlugFree's strict check
// so renames don't silently mutate.
func (s *ProjectService) nextAvailableSlug(projectID, base string) (string, error) {
	if base == "" {
		return base, nil
	}
	posts, err := s.posts.ListByProject(projectID)
	if err != nil {
		return "", err
	}
	taken := make(map[string]bool, len(posts)+1)
	taken["about"] = true
	for _, p := range posts {
		taken[p.Slug] = true
	}
	if !taken[base] {
		return base, nil
	}
	for n := 2; n < 10000; n++ {
		candidate := fmt.Sprintf("%s-%d", base, n)
		if !taken[candidate] {
			return candidate, nil
		}
	}
	return "", fmt.Errorf("could not find a free slug for base %q", base)
}

// assertSlugFree checks that no other post in the project uses the same slug.
// Cross-doc check is no longer needed — pages don't exist as user content.
func (s *ProjectService) assertSlugFree(projectID, selfID, slug string) error {
	if slug == "" {
		return nil
	}
	if slug == "about" {
		return fmt.Errorf("slug %q is reserved by the About page", slug)
	}
	posts, err := s.posts.ListByProject(projectID)
	if err != nil {
		return err
	}
	for _, p := range posts {
		if p.ID != selfID && p.Slug == slug {
			return fmt.Errorf("slug %q is already used by another post", slug)
		}
	}
	return nil
}

func newDefaultProject(name, template string) domain.Project {
	now := time.Now()
	id := fmt.Sprintf("p_%d", now.UnixNano())
	return domain.Project{
		Meta: domain.ProjectMeta{
			ID:         id,
			Name:       name,
			Template:   template,
			CreatedAt:  now,
			UpdatedAt:  now,
			LastOpened: now,
		},
		Site: domain.SiteConfig{
			Name:        name,
			URL:         "https://example.com",
			Author:      "",
			Description: "",
		},
		Theme:           domain.Theme{Template: template},
		Header:          domain.HeaderConfig{Tagline: ""},
		Footer:          domain.FooterConfig{Copyright: "", Social: []domain.SocialLink{}},
		Navigation:      []domain.NavLink{},
		AboutContent:    "",
		HomeContent:     "",
		HomeShowRecent:  true,
		HomeRecentCount: 3,
		Posts:           []domain.Post{},
		Export:          domain.ExportPrefs{},
	}
}
