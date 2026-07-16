package repository

import (
	"codeflash/database"
	"codeflash/models"
	"time"
)

// SaveProgress 保存答题记录（自动设置答题时间）
func SaveProgress(questionID, category string, correct bool) error {
	progress := models.Progress{
		QuestionID: questionID,
		Category:   category,
		Correct:    correct,
		AnsweredAt: time.Now().Unix(),
	}
	return database.DB.Create(&progress).Error
}

// CountProgressByCategory 统计某个分类的答题情况
func CountProgressByCategory(category string) (total, correct, wrong int64) {
	database.DB.Model(&models.Progress{}).Where("category = ?", category).Count(&total)
	database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", category, true).Count(&correct)
	database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", category, false).Count(&wrong)
	return
}

// CountTotalProgress 统计全局答题情况
func CountTotalProgress() (total, correct int64) {
	database.DB.Model(&models.Progress{}).Count(&total)
	database.DB.Model(&models.Progress{}).Where("correct = ?", true).Count(&correct)
	return
}

// GetWrongQuestions 获取错题列表（可选分类筛选）
func GetWrongQuestions(category string) []models.Question {
	subQuery := database.DB.Model(&models.Progress{}).
		Select("question_id").
		Where("correct = ?", false)

	if category != "" {
		subQuery = subQuery.Where("category = ?", category)
	}

	var questions []models.Question
	database.DB.Where("id IN (?)", subQuery).Find(&questions)
	return questions
}

// ResetProgress 重置进度（全部或按分类）
func ResetProgress(category string) {
	if category == "" {
		database.DB.Exec("DELETE FROM progresses")
	} else {
		database.DB.Where("category = ?", category).Delete(&models.Progress{})
	}
}
