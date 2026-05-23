package service

import (
	"blog-editor/internal/domain"
	"blog-editor/internal/export"
)

type ExportService struct {
	projects *ProjectService
}

func NewExportService(projects *ProjectService) *ExportService {
	return &ExportService{projects: projects}
}

func (s *ExportService) Templates() []domain.TemplateInfo {
	return export.AvailableTemplates()
}

func (s *ExportService) Export(req domain.ExportRequest) domain.ExportResult {
	if req.OutputDir == "" {
		return domain.ExportResult{OK: false, Message: "no output directory selected"}
	}
	p, err := s.projects.Open(req.ProjectID)
	if err != nil {
		return domain.ExportResult{OK: false, Message: "project not found: " + err.Error()}
	}
	path, err := export.Project(req.OutputDir, p, export.ProjectOptions{PostsOnly: req.PostsOnly})
	if err != nil {
		return domain.ExportResult{OK: false, Message: err.Error()}
	}

	p.Export.LastOutputDir = req.OutputDir
	_ = s.projects.Save(p)

	msg := "Exported."
	if req.PostsOnly {
		msg = "Updated content (custom code preserved)."
	}
	return domain.ExportResult{
		OK:      true,
		Path:    path,
		Posts:   len(p.Posts),
		Message: msg,
	}
}
