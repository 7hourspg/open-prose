package sqlite

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	_ "modernc.org/sqlite"
)

const schema = `
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  template    TEXT NOT NULL,
  config      TEXT NOT NULL,
  export_dir  TEXT NOT NULL DEFAULT '',
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  last_opened DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  tags        TEXT NOT NULL DEFAULT '[]',
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (project_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_posts_project ON posts(project_id);

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
`

// migrations are idempotent ALTER TABLE statements run after CREATE TABLE IF
// NOT EXISTS. SQLite raises "duplicate column name" when a column already
// exists; we swallow that so the migration is safe to re-run on every boot.
var migrations = []string{
	`ALTER TABLE posts ADD COLUMN cover_image TEXT NOT NULL DEFAULT ''`,
	`ALTER TABLE posts ADD COLUMN author TEXT NOT NULL DEFAULT ''`,
	`ALTER TABLE posts ADD COLUMN canonical TEXT NOT NULL DEFAULT ''`,
	`ALTER TABLE posts ADD COLUMN no_index INTEGER NOT NULL DEFAULT 0`,
	`ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published'`,
	`ALTER TABLE posts ADD COLUMN position INTEGER NOT NULL DEFAULT 0`,
	`UPDATE posts SET position = rowid WHERE position = 0`,
}

func Open() (*sql.DB, error) {
	root, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(root, "OpenProse")
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		legacy := filepath.Join(root, "BlogEditor")
		if _, err := os.Stat(legacy); err == nil {
			if err := os.Rename(legacy, dir); err != nil {
				return nil, fmt.Errorf("migrate data dir: %w", err)
			}
		}
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	dsn := filepath.Join(dir, "blog-editor.db") + "?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)"
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	if _, err := db.Exec(schema); err != nil {
		return nil, fmt.Errorf("apply schema: %w", err)
	}
	for _, m := range migrations {
		if _, err := db.Exec(m); err != nil && !isDuplicateColumn(err) {
			return nil, fmt.Errorf("migrate %q: %w", m, err)
		}
	}
	return db, nil
}

func isDuplicateColumn(err error) bool {
	return err != nil && strings.Contains(err.Error(), "duplicate column name")
}
