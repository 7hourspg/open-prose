// Package media handles project-scoped image storage on disk.
//
// Images live under <userConfigDir>/OpenProse/projects/<projectID>/media/.
// They are served to the editor at /media/<filename> via an asset server
// handler (which resolves the current project through the App), and copied
// into <output>/public/media/ at export time so the deployed site references
// them at the same /media/<filename> URL.
package media

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// Dir returns the on-disk media directory for a project.
func Dir(projectID string) (string, error) {
	if projectID == "" {
		return "", fmt.Errorf("empty project id")
	}
	cfg, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(cfg, "OpenProse", "projects", projectID, "media"), nil
}

// Save decodes a data: URL and writes it to the project's media dir.
// It returns the public URL ("/media/<filename>") suitable for embedding
// in markdown.
func Save(projectID, dataURL, filename string) (string, error) {
	dir, err := Dir(projectID)
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}

	mime, payload, err := decodeDataURL(dataURL)
	if err != nil {
		return "", err
	}

	name := uniqueName(dir, sanitize(filename), mime)
	dst := filepath.Join(dir, name)
	if err := os.WriteFile(dst, payload, 0o644); err != nil {
		return "", err
	}
	return "/media/" + name, nil
}

// Serve returns an http.Handler that serves /media/<filename> requests
// from the project directory whose ID is returned by current().
//
// current() runs per-request so the returned handler is stable across
// project switches.
func Serve(current func() string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const prefix = "/media/"
		if !strings.HasPrefix(r.URL.Path, prefix) {
			http.NotFound(w, r)
			return
		}
		name := strings.TrimPrefix(r.URL.Path, prefix)
		if name == "" || strings.Contains(name, "..") || strings.ContainsRune(name, '/') {
			http.NotFound(w, r)
			return
		}
		projectID := current()
		if projectID == "" {
			http.NotFound(w, r)
			return
		}
		dir, err := Dir(projectID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.ServeFile(w, r, filepath.Join(dir, name))
	})
}

// ReadAsDataURL returns the named file from the project's media dir
// encoded as a data URL ("data:<mime>;base64,..."). The MIME type is
// detected from the file content. Used by the editor to render images
// in dev mode (where Vite serves the frontend, not Wails).
func ReadAsDataURL(projectID, filename string) (string, error) {
	dir, err := Dir(projectID)
	if err != nil {
		return "", err
	}
	// Strip any path components so callers can pass "/media/foo.png" verbatim.
	name := filepath.Base(filename)
	if name == "." || name == "/" || name == "" {
		return "", fmt.Errorf("invalid filename")
	}
	path := filepath.Join(dir, name)
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	mime := http.DetectContentType(data)
	return "data:" + mime + ";base64," + base64.StdEncoding.EncodeToString(data), nil
}

// CopyTo copies every file in the project's media directory into dest.
// dest is created if it doesn't exist. Missing source dir is not an error
// (a project may not have any media yet).
func CopyTo(projectID, dest string) error {
	src, err := Dir(projectID)
	if err != nil {
		return err
	}
	entries, err := os.ReadDir(src)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if len(entries) == 0 {
		return nil
	}
	if err := os.MkdirAll(dest, 0o755); err != nil {
		return err
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if err := copyFile(filepath.Join(src, e.Name()), filepath.Join(dest, e.Name())); err != nil {
			return err
		}
	}
	return nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

// decodeDataURL parses "data:<mime>;base64,<payload>" and returns mime + bytes.
func decodeDataURL(s string) (mime string, payload []byte, err error) {
	if !strings.HasPrefix(s, "data:") {
		return "", nil, fmt.Errorf("not a data URL")
	}
	rest := strings.TrimPrefix(s, "data:")
	semi := strings.IndexByte(rest, ';')
	comma := strings.IndexByte(rest, ',')
	if comma < 0 {
		return "", nil, fmt.Errorf("malformed data URL")
	}
	if semi >= 0 && semi < comma {
		mime = rest[:semi]
	} else {
		mime = rest[:comma]
	}
	body := rest[comma+1:]
	// We only support base64-encoded data URLs (the only kind FileReader produces).
	payload, err = base64.StdEncoding.DecodeString(body)
	if err != nil {
		return "", nil, fmt.Errorf("decode base64: %w", err)
	}
	return mime, payload, nil
}

var (
	safe       = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)
	mimeToExt  = map[string]string{
		"image/png":     ".png",
		"image/jpeg":    ".jpg",
		"image/jpg":     ".jpg",
		"image/gif":     ".gif",
		"image/webp":    ".webp",
		"image/svg+xml": ".svg",
		"image/avif":    ".avif",
	}
)

func sanitize(name string) string {
	base := filepath.Base(name)
	if base == "." || base == "/" || base == "" {
		base = "image"
	}
	return strings.Trim(safe.ReplaceAllString(base, "-"), "-_.")
}

// uniqueName picks a non-colliding filename. Falls back to mime extension
// if the input had none.
func uniqueName(dir, name, mime string) string {
	if name == "" {
		name = "image"
	}
	if filepath.Ext(name) == "" {
		name += mimeToExt[mime]
	}
	candidate := name
	ext := filepath.Ext(candidate)
	stem := strings.TrimSuffix(candidate, ext)
	for i := 1; ; i++ {
		if _, err := os.Stat(filepath.Join(dir, candidate)); os.IsNotExist(err) {
			return candidate
		}
		candidate = fmt.Sprintf("%s-%d%s", stem, i, ext)
	}
}
