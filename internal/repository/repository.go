package repository

import "blog-editor/internal/domain"

type ProjectRepository interface {
	List() ([]domain.ProjectMeta, error)
	Get(id string) (domain.Project, error)
	Create(p domain.Project) error
	UpdateConfig(id string, name, template string, cfg domain.ProjectConfig, exportDir string) error
	UpdateLastOpened(id string) error
	Rename(id, name string) error
	Delete(id string) error
}

type PostRepository interface {
	ListByProject(projectID string) ([]domain.Post, error)
	Get(projectID, postID string) (domain.Post, error)
	Create(projectID string, p domain.Post) error
	Update(projectID string, p domain.Post) error
	Delete(projectID, postID string) error
	Reorder(projectID string, postIDs []string) error
}
