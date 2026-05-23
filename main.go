package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"blog-editor/internal/api"
	"blog-editor/internal/media"
	"blog-editor/internal/repository/sqlite"
	"blog-editor/internal/service"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	db, err := sqlite.Open()
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	projectRepo := sqlite.NewProjectRepo(db)
	postRepo := sqlite.NewPostRepo(db)
	settingsRepo := sqlite.NewSettingsRepo(db)

	projectSvc := service.NewProjectService(projectRepo, postRepo)
	exportSvc := service.NewExportService(projectSvc)

	app := api.NewApp(projectSvc, exportSvc, settingsRepo)

	err = wails.Run(&options.App{
		Title:  "Open Prose",
		Width:  1280,
		Height: 820,
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: media.Serve(app.CurrentProjectID),
		},
		BackgroundColour: &options.RGBA{R: 10, G: 10, B: 10, A: 1},
		OnStartup:        app.Startup,
		OnShutdown:       app.OnShutdown,
		Bind: []any{
			app,
		},
	})

	if err != nil {
		log.Println("Error:", err.Error())
	}
}
