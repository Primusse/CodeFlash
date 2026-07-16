package handlers

import (
	"codeflash/dto"
	"codeflash/models"
	"codeflash/repository"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ImportQuestions 批量导入题目（upsert，已存在则跳过）
func ImportQuestions(c *gin.Context) {
	defaultCategory := c.Query("category")

	var questions []models.Question
	if err := c.ShouldBindJSON(&questions); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON: expected an array of questions"})
		return
	}

	if len(questions) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty array"})
		return
	}

	imported := 0
	skipped := 0
	for i := range questions {
		q := &questions[i]
		if q.ID == "" {
			skipped++
			continue
		}

		// 确定分类：题目自带 > query 参数 > 从 ID 前缀推断
		if q.Category == "" {
			if defaultCategory != "" {
				q.Category = defaultCategory
			} else {
				for idx, ch := range q.ID {
					if ch == '-' {
						q.Category = q.ID[:idx]
						break
					}
				}
			}
		}

		if repository.QuestionExists(q.ID) {
			skipped++
			continue
		}

		if err := repository.CreateQuestion(q); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("failed to insert %s: %v", q.ID, err),
			})
			return
		}
		imported++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "import complete",
		"imported": imported,
		"skipped":  skipped,
		"total":    len(questions),
	})
}

// ListQuestions 获取题目列表（可选分类筛选）
func ListQuestions(c *gin.Context) {
	category := c.Query("category")
	questions := repository.ListQuestions(category)
	c.JSON(http.StatusOK, gin.H{"questions": questions, "total": len(questions)})
}

// UpdateQuestion 更新题目
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	existing, err := repository.GetQuestionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	var update dto.QuestionUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if update.Question != "" {
		existing.Question = update.Question
	}
	if update.Subcategory != "" {
		existing.Subcategory = update.Subcategory
	}
	if update.Difficulty != "" {
		existing.Difficulty = update.Difficulty
	}
	if update.Type != "" {
		existing.Type = update.Type
	}
	if update.Options != "" {
		existing.Options = update.Options
	}
	if update.Answer != "" {
		existing.Answer = update.Answer
	}
	if update.Explanation != "" {
		existing.Explanation = update.Explanation
	}
	if update.Category != "" {
		existing.Category = update.Category
	}

	repository.UpdateQuestion(existing)
	c.JSON(http.StatusOK, gin.H{"question": existing})
}

// DeleteQuestion 删除题目
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	rows, err := repository.DeleteQuestion(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": id})
}
