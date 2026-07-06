package database

import (
	"codeflash/models"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(dbPath string) error {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return err
	}

	return DB.AutoMigrate(&models.Question{}, &models.Progress{})
}

func SeedQuestions(dataDir string) error {
	// Auto-discover all JSON files in the data directory
	entries, err := os.ReadDir(dataDir)
	if err != nil {
		return fmt.Errorf("failed to read data directory %s: %w", dataDir, err)
	}

	for _, entry := range entries {
		if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
			continue
		}

		filename := entry.Name()
		category := filename[:len(filename)-len(filepath.Ext(filename))] // strip .json

		path := filepath.Join(dataDir, filename)
		data, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", path, err)
		}

		var questions []models.Question
		if err := json.Unmarshal(data, &questions); err != nil {
			return fmt.Errorf("failed to parse %s: %w", path, err)
		}

		newCount := 0
		for i := range questions {
			questions[i].Category = category
			if questions[i].ID == "" {
				questions[i].ID = fmt.Sprintf("%s-%03d", category, i+1)
			}

			// Only insert if question ID doesn't exist yet
			var existing models.Question
			if err := DB.Where("id = ?", questions[i].ID).First(&existing).Error; err != nil {
				if err := DB.Create(&questions[i]).Error; err != nil {
					return fmt.Errorf("failed to insert question %s: %w", questions[i].ID, err)
				}
				newCount++
			}
		}
		if newCount > 0 {
			fmt.Printf("Seeded %d new questions for category: %s\n", newCount, category)
		}
	}
	return nil
}
