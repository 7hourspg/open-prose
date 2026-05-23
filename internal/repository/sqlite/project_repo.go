package sqlite

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"blog-editor/internal/domain"
)

type ProjectRepo struct {
	db *sql.DB
}

func NewProjectRepo(db *sql.DB) *ProjectRepo {
	return &ProjectRepo{db: db}
}

func (r *ProjectRepo) List() ([]domain.ProjectMeta, error) {
	rows, err := r.db.Query(`
		SELECT
		  p.id, p.name, p.template, p.created_at, p.updated_at, p.last_opened,
		  (SELECT COUNT(1) FROM posts WHERE project_id = p.id) AS post_count
		FROM projects p
		ORDER BY p.last_opened DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []domain.ProjectMeta{}
	for rows.Next() {
		var m domain.ProjectMeta
		if err := rows.Scan(
			&m.ID, &m.Name, &m.Template,
			&m.CreatedAt, &m.UpdatedAt, &m.LastOpened,
			&m.PostCount,
		); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

func (r *ProjectRepo) Get(id string) (domain.Project, error) {
	row := r.db.QueryRow(`
		SELECT id, name, template, config, export_dir, created_at, updated_at, last_opened
		FROM projects WHERE id = ?
	`, id)

	var (
		p          domain.Project
		configJSON string
		exportDir  string
	)
	err := row.Scan(
		&p.Meta.ID, &p.Meta.Name, &p.Meta.Template,
		&configJSON, &exportDir,
		&p.Meta.CreatedAt, &p.Meta.UpdatedAt, &p.Meta.LastOpened,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Project{}, fmt.Errorf("project %s not found", id)
	}
	if err != nil {
		return domain.Project{}, err
	}

	var cfg domain.ProjectConfig
	if err := json.Unmarshal([]byte(configJSON), &cfg); err != nil {
		return domain.Project{}, fmt.Errorf("decode config: %w", err)
	}
	p.Site = cfg.Site
	p.Theme = cfg.Theme
	p.Header = cfg.Header
	p.Footer = cfg.Footer
	p.Navigation = cfg.Navigation
	p.AboutContent = cfg.AboutContent
	p.HomeContent = cfg.HomeContent
	p.HomeShowRecent = cfg.HomeShowRecent
	p.HomeRecentCount = cfg.HomeRecentCount
	p.Export = domain.ExportPrefs{LastOutputDir: exportDir}
	if p.Navigation == nil {
		p.Navigation = []domain.NavLink{}
	}
	if p.Footer.Social == nil {
		p.Footer.Social = []domain.SocialLink{}
	}
	return p, nil
}

func (r *ProjectRepo) Create(p domain.Project) error {
	cfg := domain.ProjectConfig{
		Site:            p.Site,
		Theme:           p.Theme,
		Header:          p.Header,
		Footer:          p.Footer,
		Navigation:      nilSliceToEmpty(p.Navigation),
		AboutContent:    p.AboutContent,
		HomeContent:     p.HomeContent,
		HomeShowRecent:  p.HomeShowRecent,
		HomeRecentCount: p.HomeRecentCount,
	}
	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(`
		INSERT INTO projects (id, name, template, config, export_dir, created_at, updated_at, last_opened)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`,
		p.Meta.ID, p.Meta.Name, p.Theme.Template,
		string(cfgJSON), p.Export.LastOutputDir,
		p.Meta.CreatedAt, p.Meta.UpdatedAt, p.Meta.LastOpened,
	)
	return err
}

func (r *ProjectRepo) UpdateConfig(id, name, template string, cfg domain.ProjectConfig, exportDir string) error {
	cfgJSON, err := json.Marshal(cfg)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(`
		UPDATE projects
		SET name = ?, template = ?, config = ?, export_dir = ?, updated_at = ?
		WHERE id = ?
	`,
		name, template, string(cfgJSON), exportDir, time.Now(), id,
	)
	return err
}

func (r *ProjectRepo) UpdateLastOpened(id string) error {
	_, err := r.db.Exec(`UPDATE projects SET last_opened = ? WHERE id = ?`, time.Now(), id)
	return err
}

func (r *ProjectRepo) Rename(id, name string) error {
	_, err := r.db.Exec(
		`UPDATE projects SET name = ?, updated_at = ? WHERE id = ?`,
		name, time.Now(), id,
	)
	return err
}

func (r *ProjectRepo) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM projects WHERE id = ?`, id)
	return err
}

func nilSliceToEmpty(s []domain.NavLink) []domain.NavLink {
	if s == nil {
		return []domain.NavLink{}
	}
	return s
}
