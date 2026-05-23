package export

import (
	"embed"

	"blog-editor/internal/domain"
)

//go:embed all:templates
var templateFS embed.FS

func AvailableTemplates() []domain.TemplateInfo {
	return []domain.TemplateInfo{
		{
			ID:          "minimal",
			Name:        "Minimal",
			Description: "Clean serif typography on a white background. The classic essay look.",
			Accent:      "#111111",
		},
		{
			ID:          "magazine",
			Name:        "Magazine",
			Description: "Bold display headlines, generous whitespace, editorial feel.",
			Accent:      "#dc2626",
		},
		{
			ID:          "developer",
			Name:        "Developer",
			Description: "Mono headings, dark mode by default, tuned for technical writing.",
			Accent:      "#22d3ee",
		},
		{
			ID:          "notebook",
			Name:        "Notebook",
			Description: "Warm paper tones and refined serif typography. For personal essays.",
			Accent:      "#b45309",
		},
		{
			ID:          "noir",
			Name:        "Noir",
			Description: "Elegant dark mode with serif typography and amber accents. Literary, not technical.",
			Accent:      "#e0a96d",
		},
		{
			ID:          "newsletter",
			Name:        "Newsletter",
			Description: "Author-led layout with a personal hero. For weekly letters and personal blogs.",
			Accent:      "#1d4ed8",
		},
	}
}
