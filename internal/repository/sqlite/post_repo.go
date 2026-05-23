package sqlite

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"blog-editor/internal/domain"
)

type PostRepo struct {
	db *sql.DB
}

func NewPostRepo(db *sql.DB) *PostRepo {
	return &PostRepo{db: db}
}

const postCols = `id, title, slug, description, content, tags, cover_image, author, canonical, no_index, status, position, created_at, updated_at`

func (r *PostRepo) ListByProject(projectID string) ([]domain.Post, error) {
	rows, err := r.db.Query(`
		SELECT `+postCols+`
		FROM posts WHERE project_id = ?
		ORDER BY position DESC, created_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []domain.Post{}
	for rows.Next() {
		p, err := scanPost(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r *PostRepo) Get(projectID, postID string) (domain.Post, error) {
	row := r.db.QueryRow(`
		SELECT `+postCols+`
		FROM posts WHERE project_id = ? AND id = ?
	`, projectID, postID)
	p, err := scanPost(row)
	if errors.Is(err, sql.ErrNoRows) {
		return domain.Post{}, fmt.Errorf("post %s not found", postID)
	}
	return p, err
}

func (r *PostRepo) Create(projectID string, p domain.Post) error {
	tagsJSON, err := json.Marshal(p.Tags)
	if err != nil {
		return err
	}
	status := p.Status
	if status == "" {
		status = "published"
	}
	if p.Position == 0 {
		var maxPos sql.NullInt64
		if err := r.db.QueryRow(
			`SELECT MAX(position) FROM posts WHERE project_id = ?`, projectID,
		).Scan(&maxPos); err != nil {
			return err
		}
		if maxPos.Valid {
			p.Position = maxPos.Int64 + 1
		} else {
			p.Position = 1
		}
	}
	_, err = r.db.Exec(`
		INSERT INTO posts (id, project_id, title, slug, description, content, tags, cover_image, author, canonical, no_index, status, position, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		p.ID, projectID, p.Title, p.Slug, p.Description, p.Content,
		string(tagsJSON), p.CoverImage, p.Author, p.Canonical, boolToInt(p.NoIndex),
		status, p.Position, p.CreatedAt, p.UpdatedAt,
	)
	return err
}

func (r *PostRepo) Update(projectID string, p domain.Post) error {
	tagsJSON, err := json.Marshal(p.Tags)
	if err != nil {
		return err
	}
	status := p.Status
	if status == "" {
		status = "published"
	}
	_, err = r.db.Exec(`
		UPDATE posts
		SET title = ?, slug = ?, description = ?, content = ?, tags = ?,
		    cover_image = ?, author = ?, canonical = ?, no_index = ?,
		    status = ?, updated_at = ?
		WHERE id = ? AND project_id = ?
	`,
		p.Title, p.Slug, p.Description, p.Content, string(tagsJSON),
		p.CoverImage, p.Author, p.Canonical, boolToInt(p.NoIndex),
		status, p.UpdatedAt, p.ID, projectID,
	)
	return err
}

func (r *PostRepo) Delete(projectID, postID string) error {
	_, err := r.db.Exec(`DELETE FROM posts WHERE project_id = ? AND id = ?`, projectID, postID)
	return err
}

// Reorder assigns positions to the given post IDs, top-of-list first. The
// first id in postIDs gets the highest position so it sorts to the top under
// `ORDER BY position DESC`.
func (r *PostRepo) Reorder(projectID string, postIDs []string) error {
	if len(postIDs) == 0 {
		return nil
	}
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	stmt, err := tx.Prepare(`UPDATE posts SET position = ? WHERE project_id = ? AND id = ?`)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for i, id := range postIDs {
		pos := int64(len(postIDs) - i)
		if _, err := stmt.Exec(pos, projectID, id); err != nil {
			return err
		}
	}
	return tx.Commit()
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanPost(s rowScanner) (domain.Post, error) {
	var (
		p        domain.Post
		tagsJSON string
		noIndex  int
	)
	if err := s.Scan(
		&p.ID, &p.Title, &p.Slug, &p.Description, &p.Content,
		&tagsJSON, &p.CoverImage, &p.Author, &p.Canonical, &noIndex,
		&p.Status, &p.Position, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		return domain.Post{}, err
	}
	if tagsJSON != "" {
		if err := json.Unmarshal([]byte(tagsJSON), &p.Tags); err != nil {
			return domain.Post{}, fmt.Errorf("decode tags: %w", err)
		}
	}
	if p.Tags == nil {
		p.Tags = []string{}
	}
	p.NoIndex = noIndex != 0
	if p.Status == "" {
		p.Status = "published"
	}
	return p, nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
