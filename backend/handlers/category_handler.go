package handlers

import (
	"codeflash/dto"
	"codeflash/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetCategories 获取所有分类及统计信息
func GetCategories(c *gin.Context) {
	var result []dto.CategoryInfo
	for _, cat := range repository.GetDistinctCategories() {
		total, choice, fill := repository.CountQuestionsByCategory(cat)
		answered, correct, _ := repository.CountProgressByCategory(cat)

		meta := repository.GetCategoryMeta(cat)
		result = append(result, dto.CategoryInfo{
			Category:      cat,
			Name:          meta.Name,
			Icon:          meta.Icon,
			TotalCount:    total,
			ChoiceCount:   choice,
			FillCount:     fill,
			AnsweredCount: answered,
			CorrectCount:  correct,
		})
	}

	c.JSON(http.StatusOK, gin.H{"categories": result})
}
