package repository

import (
	"codeflash/database"
	"codeflash/models"
)

// GetDistinctCategories 获取所有存在题目的分类
func GetDistinctCategories() []string {
	var cats []string
	database.DB.Model(&models.Question{}).Distinct("category").Pluck("category", &cats)
	return cats
}

// CountQuestionsByCategory 统计某个分类的题目数量
func CountQuestionsByCategory(category string) (total, choice, fill int64) {
	database.DB.Model(&models.Question{}).Where("category = ?", category).Count(&total)
	database.DB.Model(&models.Question{}).Where("category = ? AND type = ?", category, "choice").Count(&choice)
	database.DB.Model(&models.Question{}).Where("category = ? AND type = ?", category, "fill").Count(&fill)
	return
}

// ListQuestionsByCategoryAndType 按分类和题型查询题目（用于随机抽题）
func ListQuestionsByCategoryAndType(category, qType string) []models.Question {
	query := database.DB.Model(&models.Question{}).Where("category = ?", category)
	if qType == "choice" || qType == "fill" {
		query = query.Where("type = ?", qType)
	}
	var questions []models.Question
	query.Find(&questions)
	return questions
}

// GetQuestionByID 按 ID 查询题目
func GetQuestionByID(id string) (*models.Question, error) {
	var q models.Question
	if err := database.DB.Where("id = ?", id).First(&q).Error; err != nil {
		return nil, err
	}
	return &q, nil
}

// ListQuestions 查询所有题目（可选分类筛选）
func ListQuestions(category string) []models.Question {
	query := database.DB.Model(&models.Question{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	var questions []models.Question
	query.Order("category, id").Find(&questions)
	return questions
}

// CreateQuestion 创建题目
func CreateQuestion(q *models.Question) error {
	return database.DB.Create(q).Error
}

// UpdateQuestion 更新题目
func UpdateQuestion(q *models.Question) error {
	return database.DB.Save(q).Error
}

// DeleteQuestion 删除题目（级联删除进度记录）
func DeleteQuestion(id string) (int64, error) {
	result := database.DB.Where("id = ?", id).Delete(&models.Question{})
	if result.RowsAffected > 0 {
		database.DB.Where("question_id = ?", id).Delete(&models.Progress{})
	}
	return result.RowsAffected, result.Error
}

// QuestionExists 判断题目是否存在
func QuestionExists(id string) bool {
	var count int64
	database.DB.Model(&models.Question{}).Where("id = ?", id).Count(&count)
	return count > 0
}
