package handlers

import (
	"codeflash/dto"
	"codeflash/models"
)

// ToSafeQuestion 将数据库 Question 转换为不含答案的 SafeQuestion
func ToSafeQuestion(q models.Question) dto.SafeQuestion {
	return dto.SafeQuestion{
		ID:          q.ID,
		Category:    q.Category,
		Subcategory: q.Subcategory,
		Type:        q.Type,
		Difficulty:  q.Difficulty,
		Question:    q.Question,
		Options:     q.Options,
	}
}

// ToSafeQuestionList 批量转换
func ToSafeQuestionList(questions []models.Question) []dto.SafeQuestion {
	result := make([]dto.SafeQuestion, 0, len(questions))
	for _, q := range questions {
		result = append(result, ToSafeQuestion(q))
	}
	return result
}

// ToWrongQuestion 转换为带答案的错题（错题本需要显示答案）
func ToWrongQuestion(q models.Question) map[string]interface{} {
	return map[string]interface{}{
		"id":          q.ID,
		"category":    q.Category,
		"subcategory": q.Subcategory,
		"type":        q.Type,
		"difficulty":  q.Difficulty,
		"question":    q.Question,
		"options":     q.Options,
		"answer":      q.Answer,
		"explanation": q.Explanation,
	}
}
