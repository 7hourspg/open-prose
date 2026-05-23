package api

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	goruntime "runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"blog-editor/internal/domain"
	"blog-editor/internal/media"
	"blog-editor/internal/repository/sqlite"
	"blog-editor/internal/service"
)

// App is the Wails-bound facade. Methods here are exposed to the frontend via
// generated TypeScript bindings; they delegate to services.
type App struct {
	ctx      context.Context
	projects *service.ProjectService
	exports  *service.ExportService
	settings *sqlite.SettingsRepo

	currentProjectID atomic.Value // string; set when frontend opens a project

	previewMu    sync.Mutex
	previewCmd   *exec.Cmd
	previewState atomic.Value // PreviewState
}

func NewApp(projects *service.ProjectService, exports *service.ExportService, settings *sqlite.SettingsRepo) *App {
	return &App{projects: projects, exports: exports, settings: settings}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// CurrentProjectID returns the project id last opened by the frontend.
// Used by the media asset handler so /media/<file> can resolve to the
// right on-disk directory without the URL embedding the project id.
func (a *App) CurrentProjectID() string {
	v, _ := a.currentProjectID.Load().(string)
	return v
}

// --- Projects ------------------------------------------------------------

func (a *App) ListProjects() ([]domain.ProjectMeta, error) {
	return a.projects.List()
}

func (a *App) CreateProject(name, template string) (domain.ProjectMeta, error) {
	return a.projects.Create(name, template)
}

func (a *App) OpenProject(id string) (domain.Project, error) {
	p, err := a.projects.Open(id)
	if err == nil {
		a.currentProjectID.Store(id)
	}
	return p, err
}

func (a *App) SetCurrentProject(id string) {
	a.currentProjectID.Store(id)
}

func (a *App) SaveProject(p domain.Project) error {
	return a.projects.Save(p)
}

func (a *App) RenameProject(id, name string) error {
	return a.projects.Rename(id, name)
}

func (a *App) DuplicateProject(id string) (domain.ProjectMeta, error) {
	return a.projects.Duplicate(id)
}

func (a *App) DeleteProject(id string) error {
	return a.projects.Delete(id)
}

// --- Posts ---------------------------------------------------------------

func (a *App) ListPosts(projectID string) ([]domain.Post, error) {
	return a.projects.ListPosts(projectID)
}

func (a *App) CreatePost(projectID string, p domain.Post) (domain.Post, error) {
	return a.projects.CreatePost(projectID, p)
}

func (a *App) UpdatePost(projectID string, p domain.Post) (domain.Post, error) {
	return a.projects.UpdatePost(projectID, p)
}

func (a *App) DeletePost(projectID, postID string) error {
	return a.projects.DeletePost(projectID, postID)
}

func (a *App) ReorderPosts(projectID string, postIDs []string) error {
	return a.projects.ReorderPosts(projectID, postIDs)
}

// --- Media ---------------------------------------------------------------

// UploadImage stores a base64-encoded data URL on disk under the active
// project's media folder and returns the URL the frontend should embed
// in the post (e.g. "/media/photo.png").
func (a *App) UploadImage(dataURL, filename string) (string, error) {
	id := a.CurrentProjectID()
	return media.Save(id, dataURL, filename)
}

// ReadImage returns the named media file as a data URL. Used by the editor
// to display images in dev mode where Vite owns the frontend origin and
// the AssetServer's /media handler is not reachable.
func (a *App) ReadImage(filename string) (string, error) {
	id := a.CurrentProjectID()
	return media.ReadAsDataURL(id, filename)
}

// --- Settings ------------------------------------------------------------

func (a *App) GetSetting(key string) (string, error) {
	return a.settings.Get(key)
}

func (a *App) SetSetting(key, value string) error {
	return a.settings.Set(key, value)
}

// --- Templates / Export --------------------------------------------------

func (a *App) ListTemplates() []domain.TemplateInfo {
	return a.exports.Templates()
}

func (a *App) ExportProjectByID(req domain.ExportRequest) domain.ExportResult {
	return a.exports.Export(req)
}

// IsExportedProject reports whether the given dir already contains an exported
// Open Prose project (heuristic: presence of package.json). Used by the export
// dialog to default to "posts only" mode for re-exports.
func (a *App) IsExportedProject(dir string) bool {
	if dir == "" {
		return false
	}
	_, err := os.Stat(filepath.Join(dir, "package.json"))
	return err == nil
}

// --- Dialogs -------------------------------------------------------------

func (a *App) PickExportDir(defaultDir string) (string, error) {
	if a.ctx == nil {
		return "", nil
	}
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Choose export folder",
		DefaultDirectory:     defaultDir,
		CanCreateDirectories: true,
	})
}

// OpenURL opens a URL or local file:// path in the user's default browser.
func (a *App) OpenURL(url string) {
	if a.ctx == nil || url == "" {
		return
	}
	runtime.BrowserOpenURL(a.ctx, url)
}

// OpenFolder reveals a directory in the OS file manager.
func (a *App) OpenFolder(path string) error {
	if path == "" {
		return nil
	}
	var cmd *exec.Cmd
	switch goruntime.GOOS {
	case "darwin":
		cmd = exec.Command("open", path)
	case "windows":
		cmd = exec.Command("explorer", path)
	default:
		cmd = exec.Command("xdg-open", path)
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("open folder: %w", err)
	}
	return nil
}

// --- Toolchain / Deploy ---------------------------------------------------

type ToolchainInfo struct {
	Node        bool   `json:"node"`
	NodeVersion string `json:"nodeVersion"`
	Npm         bool   `json:"npm"`
	NpmVersion  string `json:"npmVersion"`
}

func probeVersion(bin string) string {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	out, err := exec.CommandContext(ctx, bin, "--version").Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

func (a *App) Toolchain() ToolchainInfo {
	info := ToolchainInfo{}
	if _, err := exec.LookPath("node"); err == nil {
		info.Node = true
		info.NodeVersion = probeVersion("node")
	}
	if _, err := exec.LookPath("npm"); err == nil {
		info.Npm = true
		info.NpmVersion = probeVersion("npm")
	}
	return info
}

var deployURLRe = regexp.MustCompile(`https?://[^\s]+\.vercel\.app`)

// DeployVercel runs `npx vercel --prod --yes` inside projectDir, streams
// stdout/stderr back to the frontend via wails events ("deploy:log"), and
// returns the deployment URL on success.
func (a *App) DeployVercel(projectDir string) (string, error) {
	if a.ctx == nil {
		return "", fmt.Errorf("app not started")
	}
	if projectDir == "" {
		return "", fmt.Errorf("project dir required")
	}
	if _, err := exec.LookPath("npx"); err != nil {
		return "", fmt.Errorf("npx not found — install Node.js first")
	}
	if _, err := exec.LookPath("node"); err != nil {
		return "", fmt.Errorf("node not found — install Node.js first")
	}
	if !filepath.IsAbs(projectDir) {
		return "", fmt.Errorf("project dir must be absolute: %s", projectDir)
	}

	cmd := exec.CommandContext(a.ctx, "npx", "--yes", "vercel", "--prod", "--yes")
	cmd.Dir = projectDir

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", err
	}
	cmd.Stderr = cmd.Stdout
	if err := cmd.Start(); err != nil {
		return "", fmt.Errorf("spawn vercel: %w", err)
	}

	url := ""
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := scanner.Text()
		runtime.EventsEmit(a.ctx, "deploy:log", line)
		if m := deployURLRe.FindString(line); m != "" {
			url = m
		}
	}
	if err := cmd.Wait(); err != nil {
		return url, fmt.Errorf("vercel exited: %w", err)
	}
	if url == "" {
		return "", fmt.Errorf("deployment finished but no vercel.app URL found in output")
	}
	return url, nil
}

// --- Preview (local dev server) ------------------------------------------

type PreviewState struct {
	Running    bool   `json:"running"`
	Port       int    `json:"port"`
	URL        string `json:"url"`
	ProjectDir string `json:"projectDir"`
}

func (a *App) PreviewStatus() PreviewState {
	v, _ := a.previewState.Load().(PreviewState)
	return v
}

var previewURLRe = regexp.MustCompile(`https?://localhost:(\d+)`)

func (a *App) StartPreview(projectDir string) (PreviewState, error) {
	if a.ctx == nil {
		return PreviewState{}, fmt.Errorf("app not started")
	}
	if !filepath.IsAbs(projectDir) {
		return PreviewState{}, fmt.Errorf("project dir must be absolute: %s", projectDir)
	}
	if _, err := os.Stat(filepath.Join(projectDir, "package.json")); err != nil {
		return PreviewState{}, fmt.Errorf("not a project dir (no package.json): %s", projectDir)
	}
	if _, err := exec.LookPath("npm"); err != nil {
		return PreviewState{}, fmt.Errorf("npm not found — install Node.js first")
	}

	_ = a.StopPreview()

	if _, err := os.Stat(filepath.Join(projectDir, "node_modules")); os.IsNotExist(err) {
		runtime.EventsEmit(a.ctx, "preview:log", "[install] running npm install…")
		if err := a.runStreamed(projectDir, "[install] ", "npm", "install"); err != nil {
			return PreviewState{}, fmt.Errorf("npm install failed: %w", err)
		}
		runtime.EventsEmit(a.ctx, "preview:log", "[install] done")
	}

	cmd := exec.Command("npm", "run", "dev")
	cmd.Dir = projectDir
	setProcessGroup(cmd)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return PreviewState{}, err
	}
	cmd.Stderr = cmd.Stdout
	if err := cmd.Start(); err != nil {
		return PreviewState{}, fmt.Errorf("spawn npm run dev: %w", err)
	}

	a.previewMu.Lock()
	a.previewCmd = cmd
	a.previewMu.Unlock()

	ready := make(chan PreviewState, 1)
	go func() {
		scanner := bufio.NewScanner(stdout)
		scanner.Buffer(make([]byte, 64*1024), 1024*1024)
		emitted := false
		for scanner.Scan() {
			line := scanner.Text()
			runtime.EventsEmit(a.ctx, "preview:log", line)
			if !emitted {
				if m := previewURLRe.FindStringSubmatch(line); m != nil {
					port, _ := strconv.Atoi(m[1])
					st := PreviewState{
						Running:    true,
						Port:       port,
						URL:        m[0],
						ProjectDir: projectDir,
					}
					a.previewState.Store(st)
					runtime.EventsEmit(a.ctx, "preview:ready", st)
					ready <- st
					emitted = true
				}
			}
		}
		_ = cmd.Wait()
		a.previewState.Store(PreviewState{})
		runtime.EventsEmit(a.ctx, "preview:stopped")
		a.previewMu.Lock()
		a.previewCmd = nil
		a.previewMu.Unlock()
	}()

	select {
	case st := <-ready:
		return st, nil
	case <-time.After(90 * time.Second):
		_ = a.StopPreview()
		return PreviewState{}, fmt.Errorf("preview did not become ready in 90s")
	}
}

func (a *App) StopPreview() error {
	a.previewMu.Lock()
	cmd := a.previewCmd
	a.previewMu.Unlock()
	if cmd == nil || cmd.Process == nil {
		return nil
	}
	killProcessGroup(cmd)
	done := make(chan struct{})
	go func() {
		_, _ = cmd.Process.Wait()
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		_ = cmd.Process.Kill()
	}
	a.previewState.Store(PreviewState{})
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "preview:stopped")
	}
	return nil
}

// runStreamed runs cmd to completion, prefixing each output line and emitting
// it via preview:log. Used for the install step.
func (a *App) runStreamed(dir, prefix, name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Dir = dir
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	cmd.Stderr = cmd.Stdout
	if err := cmd.Start(); err != nil {
		return err
	}
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		runtime.EventsEmit(a.ctx, "preview:log", prefix+scanner.Text())
	}
	return cmd.Wait()
}

// OnShutdown is wired into Wails' OnShutdown hook so we don't leak a
// dangling Next.js dev server when the app exits.
func (a *App) OnShutdown(_ context.Context) {
	_ = a.StopPreview()
}

var _ = io.Copy
