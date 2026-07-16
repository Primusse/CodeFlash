package handlers

import (
	"codeflash/dto"
	"codeflash/repository"
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
)

// StartQuiz 开始一组答题，随机抽取题目
func StartQuiz(c *gin.Context) {
	var req dto.QuizStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if req.Count <= 0 || req.Count > 50 {
		req.Count = 10
	}
	if req.Category == "" {
		req.Category = "java"
	}

	all := repository.ListQuestionsByCategoryAndType(req.Category, req.Type)
	if len(all) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no questions found"})
		return
	}

	// 随机打乱并截取
	rand.Shuffle(len(all), func(i, j int) { all[i], all[j] = all[j], all[i] })
	if len(all) > req.Count {
		all = all[:req.Count]
	}

	c.JSON(http.StatusOK, gin.H{
		"questions": ToSafeQuestionList(all),
		"total":     len(all),
	})
}

// SubmitAnswer 提交单个答案
func SubmitAnswer(c *gin.Context) {
	var req dto.SubmitAnswer
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	question, err := repository.GetQuestionByID(req.QuestionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	correct := req.Answer == question.Answer
	repository.SaveProgress(question.ID, question.Category, correct)

	c.JSON(http.StatusOK, dto.QuizResult{
		Correct: correct,
		Answer:  question.Answer,
		Explain: question.Explanation,
	})
}

// SubmitQuizBatch 批量提交答案
func SubmitQuizBatch(c *gin.Context) {
	var req struct {
		Answers []dto.SubmitAnswer `json:"answers"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var results []dto.BatchResult
	correctCount := 0

	for _, ans := range req.Answers {
		question, err := repository.GetQuestionByID(ans.QuestionID)
		if err != nil {
			continue
		}
		correct := ans.Answer == question.Answer
		if correct {
			correctCount++
		}

		repository.SaveProgress(question.ID, question.Category, correct)

		results = append(results, dto.BatchResult{
			QuestionID:  ans.QuestionID,
			Correct:     correct,
			YourAnswer:  ans.Answer,
			Answer:      question.Answer,
			Explanation: question.Explanation,
		})
	}

	accuracy := 0.0
	if len(results) > 0 {
		accuracy = float64(correctCount) / float64(len(results)) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"results":  results,
		"correct":  correctCount,
		"total":    len(results),
		"accuracy": accuracy,
	})
}
