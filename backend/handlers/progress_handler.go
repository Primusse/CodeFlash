package handlers

import (
	"codeflash/dto"
	"codeflash/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetProgress 获取各分类答题进度
func GetProgress(c *gin.Context) {
	var result []dto.CategoryStats
	for _, cat := range repository.GetDistinctCategories() {
		total, correct, wrong := repository.CountProgressByCategory(cat)

		pct := 0
		if total > 0 {
			pct = int(correct * 100 / total)
		}

		result = append(result, dto.CategoryStats{
			Category:    cat,
			Total:       total,
			Correct:     correct,
			Wrong:       wrong,
			ProgressPct: pct,
		})
	}

	c.JSON(http.StatusOK, gin.H{"categories": result})
}

// GetStats 获取全局统计数据
func GetStats(c *gin.Context) {
	totalAnswered, totalCorrect := repository.CountTotalProgress()

	accuracy := 0.0
	if totalAnswered > 0 {
		accuracy = float64(totalCorrect) / float64(totalAnswered) * 100
	}

	var catStats []dto.CategoryStats
	for _, cat := range repository.GetDistinctCategories() {
		total, correct, wrong := repository.CountProgressByCategory(cat)

		pct := 0
		if total > 0 {
			pct = int(correct * 100 / total)
		}
		catStats = append(catStats, dto.CategoryStats{
			Category:    cat,
			Total:       total,
			Correct:     correct,
			Wrong:       wrong,
			ProgressPct: pct,
		})
	}

	c.JSON(http.StatusOK, dto.StatsResponse{
		TotalAnswered: totalAnswered,
		TotalCorrect:  totalCorrect,
		Accuracy:      accuracy,
		Categories:    catStats,
	})
}

// GetWrongQuestions 获取错题列表
func GetWrongQuestions(c *gin.Context) {
	category := c.Query("category")
	questions := repository.GetWrongQuestions(category)

	result := make([]map[string]interface{}, 0, len(questions))
	for _, q := range questions {
		result = append(result, ToWrongQuestion(q))
	}

	c.JSON(http.StatusOK, gin.H{"questions": result})
}

// ResetProgress 重置答题进度
func ResetProgress(c *gin.Context) {
	category := c.Query("category")
	repository.ResetProgress(category)
	c.JSON(http.StatusOK, gin.H{"message": "progress reset"})
}
