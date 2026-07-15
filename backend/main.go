package main

import (
	"codeflash/config"
	"codeflash/database"
	"codeflash/handlers"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	// Init database
	if err := database.Init(cfg.DBPath); err != nil {
		log.Fatalf("Failed to init database: %v", err)
	}

	// Seed questions from JSON files
	if err := database.SeedQuestions(cfg.DataDir); err != nil {
		log.Fatalf("Failed to seed questions: %v", err)
	}

	// Setup router
	r := gin.Default()

	// CORS for dev
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		api.GET("/categories", handlers.GetCategories)
		api.POST("/quiz/start", handlers.StartQuiz)
		api.POST("/quiz/submit", handlers.SubmitAnswer)
		api.POST("/quiz/submit-batch", handlers.SubmitQuizBatch)
		api.GET("/progress", handlers.GetProgress)
		api.GET("/stats", handlers.GetStats)
		api.GET("/wrong-questions", handlers.GetWrongQuestions)
		api.POST("/questions/import", handlers.ImportQuestions)
		api.GET("/questions", handlers.ListQuestions)
		api.PUT("/questions/:id", handlers.UpdateQuestion)
		api.DELETE("/questions/:id", handlers.DeleteQuestion)
		api.DELETE("/progress", handlers.ResetProgress)

		// Category metadata
		api.GET("/category-metas", handlers.ListCategoryMetas)
		api.PUT("/category-metas/:key", handlers.UpdateCategoryMeta)
		api.GET("/icons", handlers.ListIcons)

		// Notes
		api.GET("/notes", handlers.ListNotes)
		api.POST("/notes", handlers.CreateNote)
		api.PUT("/notes/:id", handlers.UpdateNote)
		api.DELETE("/notes/:id", handlers.DeleteNote)
	}

	fmt.Printf("CodeFlash server starting on port %s...\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
