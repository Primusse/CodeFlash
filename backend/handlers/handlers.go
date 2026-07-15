package handlers

import (
	"codeflash/database"
	"codeflash/models"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
)

// categoryMeta maps category keys to display names and icons.
// Unknown categories fall back to using the key as name with 📦 icon.
// These are fallback defaults; the database category_metas table takes precedence.
var defaultCategoryMeta = map[string]struct {
	Name string
	Icon string
}{
	"java":   {Name: "Java 后端开发", Icon: "☕"},
	"golang": {Name: "Go 后端开发", Icon: "🐹"},
	"agent":  {Name: "AI Agent 开发", Icon: "🤖"},
	"docker": {Name: "Docker 容器技术", Icon: "🐳"},
}

func getCategoryName(key string) string {
	var m models.CategoryMeta
	if err := database.DB.Where("key = ?", key).First(&m).Error; err == nil {
		return m.Name
	}
	if d, ok := defaultCategoryMeta[key]; ok {
		return d.Name
	}
	return key
}

func getCategoryIcon(key string) string {
	var m models.CategoryMeta
	if err := database.DB.Where("key = ?", key).First(&m).Error; err == nil {
		return m.Icon
	}
	if d, ok := defaultCategoryMeta[key]; ok {
		return d.Icon
	}
	return "📦"
}

// getCategoryMeta returns the full CategoryMeta for a key (from DB or defaults).
func getCategoryMeta(key string) models.CategoryMeta {
	var m models.CategoryMeta
	if err := database.DB.Where("key = ?", key).First(&m).Error; err == nil {
		return m
	}
	if d, ok := defaultCategoryMeta[key]; ok {
		return models.CategoryMeta{Key: key, Name: d.Name, Icon: d.Icon}
	}
	return models.CategoryMeta{Key: key, Name: key, Icon: "📦"}
}

// getDistinctCategories returns all categories that have at least one question.
func getDistinctCategories() []string {
	var cats []string
	database.DB.Model(&models.Question{}).Distinct("category").Pluck("category", &cats)
	return cats
}

func GetCategories(c *gin.Context) {
	var result []models.CategoryInfo
	for _, cat := range getDistinctCategories() {
		var total, choice, fill, answered, correct int64
		database.DB.Model(&models.Question{}).Where("category = ?", cat).Count(&total)
		database.DB.Model(&models.Question{}).Where("category = ? AND type = ?", cat, "choice").Count(&choice)
		database.DB.Model(&models.Question{}).Where("category = ? AND type = ?", cat, "fill").Count(&fill)
		database.DB.Model(&models.Progress{}).Where("category = ?", cat).Count(&answered)
		database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", cat, true).Count(&correct)

		meta := getCategoryMeta(cat)
		result = append(result, models.CategoryInfo{
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

func StartQuiz(c *gin.Context) {
	var req models.QuizStartRequest
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

	query := database.DB.Model(&models.Question{}).Where("category = ?", req.Category)
	if req.Type == "choice" {
		query = query.Where("type = ?", "choice")
	} else if req.Type == "fill" {
		query = query.Where("type = ?", "fill")
	}

	var all []models.Question
	query.Find(&all)

	if len(all) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "no questions found"})
		return
	}

	// shuffle and pick
	rand.Shuffle(len(all), func(i, j int) { all[i], all[j] = all[j], all[i] })
	if len(all) > req.Count {
		all = all[:req.Count]
	}

	// return questions without answers
	type SafeQuestion struct {
		ID          string `json:"id"`
		Category    string `json:"category"`
		Subcategory string `json:"subcategory"`
		Type        string `json:"type"`
		Difficulty  string `json:"difficulty"`
		Question    string `json:"question"`
		Options     string `json:"options"`
	}
	var safe []SafeQuestion
	for _, q := range all {
		safe = append(safe, SafeQuestion{
			ID:          q.ID,
			Category:    q.Category,
			Subcategory: q.Subcategory,
			Type:        q.Type,
			Difficulty:  q.Difficulty,
			Question:    q.Question,
			Options:     q.Options,
		})
	}

	c.JSON(http.StatusOK, gin.H{"questions": safe, "total": len(safe)})
}

func SubmitAnswer(c *gin.Context) {
	var req models.SubmitAnswer
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var question models.Question
	if err := database.DB.Where("id = ?", req.QuestionID).First(&question).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	correct := req.Answer == question.Answer

	// save progress
	progress := models.Progress{
		QuestionID: req.QuestionID,
		Category:   question.Category,
		Correct:    correct,
		AnsweredAt: 0, // will use current time in real usage
	}
	database.DB.Create(&progress)

	c.JSON(http.StatusOK, models.QuizResult{
		Correct: correct,
		Answer:  question.Answer,
		Explain: question.Explanation,
	})
}

func GetProgress(c *gin.Context) {
	var result []models.CategoryStats
	for _, cat := range getDistinctCategories() {
		var total, correct, wrong int64
		database.DB.Model(&models.Progress{}).Where("category = ?", cat).Count(&total)
		database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", cat, true).Count(&correct)
		database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", cat, false).Count(&wrong)

		pct := 0
		if total > 0 {
			pct = int(correct * 100 / total)
		}

		result = append(result, models.CategoryStats{
			Category:    cat,
			Total:       total,
			Correct:     correct,
			Wrong:       wrong,
			ProgressPct: pct,
		})
	}

	c.JSON(http.StatusOK, gin.H{"categories": result})
}

func GetStats(c *gin.Context) {
	var totalAnswered, totalCorrect int64
	database.DB.Model(&models.Progress{}).Count(&totalAnswered)
	database.DB.Model(&models.Progress{}).Where("correct = ?", true).Count(&totalCorrect)

	accuracy := 0.0
	if totalAnswered > 0 {
		accuracy = float64(totalCorrect) / float64(totalAnswered) * 100
	}

	var catStats []models.CategoryStats
	for _, cat := range getDistinctCategories() {
		var total, correct, wrong int64
		database.DB.Model(&models.Progress{}).Where("category = ?", cat).Count(&total)
		database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", cat, true).Count(&correct)
		database.DB.Model(&models.Progress{}).Where("category = ? AND correct = ?", cat, false).Count(&wrong)

		pct := 0
		if total > 0 {
			pct = int(correct * 100 / total)
		}
		catStats = append(catStats, models.CategoryStats{
			Category:    cat,
			Total:       total,
			Correct:     correct,
			Wrong:       wrong,
			ProgressPct: pct,
		})
	}

	c.JSON(http.StatusOK, models.StatsResponse{
		TotalAnswered: totalAnswered,
		TotalCorrect:  totalCorrect,
		Accuracy:      accuracy,
		Categories:    catStats,
	})
}

func SubmitQuizBatch(c *gin.Context) {
	var req struct {
		Answers []models.SubmitAnswer `json:"answers"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	type BatchResult struct {
		QuestionID string `json:"question_id"`
		Correct    bool   `json:"correct"`
		YourAnswer string `json:"your_answer"`
		Answer     string `json:"answer"`
		Explanation string `json:"explanation"`
	}

	var results []BatchResult
	correctCount := 0

	for _, ans := range req.Answers {
		var question models.Question
		if err := database.DB.Where("id = ?", ans.QuestionID).First(&question).Error; err != nil {
			continue
		}
		correct := ans.Answer == question.Answer
		if correct {
			correctCount++
		}

		database.DB.Create(&models.Progress{
			QuestionID: ans.QuestionID,
			Category:   question.Category,
			Correct:    correct,
			AnsweredAt: 0,
		})

		results = append(results, BatchResult{
			QuestionID:  ans.QuestionID,
			Correct:     correct,
			YourAnswer:  ans.Answer,
			Answer:      question.Answer,
			Explanation: question.Explanation,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"results":      results,
		"correct":      correctCount,
		"total":        len(results),
		"accuracy":     float64(correctCount) / float64(len(results)) * 100,
	})
}

func GetWrongQuestions(c *gin.Context) {
	category := c.Query("category")

	subQuery := database.DB.Model(&models.Progress{}).
		Select("question_id").
		Where("correct = ?", false)

	if category != "" {
		subQuery = subQuery.Where("category = ?", category)
	}

	var questions []models.Question
	database.DB.Where("id IN (?)", subQuery).Find(&questions)

	// return safe version
	type SafeQuestion struct {
		ID          string `json:"id"`
		Category    string `json:"category"`
		Subcategory string `json:"subcategory"`
		Type        string `json:"type"`
		Difficulty  string `json:"difficulty"`
		Question    string `json:"question"`
		Options     string `json:"options"`
		Answer      string `json:"answer"`
		Explanation string `json:"explanation"`
	}
	var safe []SafeQuestion
	for _, q := range questions {
		safe = append(safe, SafeQuestion{
			ID:          q.ID,
			Category:    q.Category,
			Subcategory: q.Subcategory,
			Type:        q.Type,
			Difficulty:  q.Difficulty,
			Question:    q.Question,
			Options:     q.Options,
			Answer:      q.Answer,
			Explanation: q.Explanation,
		})
	}

	c.JSON(http.StatusOK, gin.H{"questions": safe})
}

func ResetProgress(c *gin.Context) {
	category := c.Query("category")
	if category == "" {
		database.DB.Exec("DELETE FROM progresses")
	} else {
		database.DB.Where("category = ?", category).Delete(&models.Progress{})
	}
	c.JSON(http.StatusOK, gin.H{"message": "progress reset"})
}

// ImportQuestions accepts a JSON array of questions and upserts them into the database.
// Optional query param: ?category=xxx sets a default category for questions without one.
// Each question must have an id; category is auto-filled from the query param or inferred from the id prefix.
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
	for _, q := range questions {
		if q.ID == "" {
			skipped++
			continue
		}

		// Determine category: question's own > query param > inferred from id prefix
		if q.Category == "" {
			if defaultCategory != "" {
				q.Category = defaultCategory
			} else {
				// Try to infer from id (e.g., "docker-001" → "docker")
				for i, ch := range q.ID {
					if ch == '-' {
						q.Category = q.ID[:i]
						break
					}
				}
			}
		}

		// Upsert: insert if not exists, skip if exists
		var existing models.Question
		if err := database.DB.Where("id = ?", q.ID).First(&existing).Error; err != nil {
			if err := database.DB.Create(&q).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to insert %s: %v", q.ID, err)})
				return
			}
			imported++
		} else {
			skipped++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "import complete",
		"imported": imported,
		"skipped":  skipped,
		"total":    len(questions),
	})
}

// ListQuestions returns all questions, optionally filtered by category.
func ListQuestions(c *gin.Context) {
	category := c.Query("category")
	query := database.DB.Model(&models.Question{})
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var questions []models.Question
	query.Order("category, id").Find(&questions)

	c.JSON(http.StatusOK, gin.H{"questions": questions, "total": len(questions)})
}

// DeleteQuestion deletes a question and its progress records by ID.
func DeleteQuestion(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	result := database.DB.Where("id = ?", id).Delete(&models.Question{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	// Also delete related progress records
	database.DB.Where("question_id = ?", id).Delete(&models.Progress{})

	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": id})
}

// ──────────────────────────────────────────────
// Note handlers
// ──────────────────────────────────────────────

// ListNotes returns all notes ordered by updated_at desc.
func ListNotes(c *gin.Context) {
	var notes []models.Note
	database.DB.Order("updated_at DESC").Find(&notes)
	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

// CreateNote creates a new note. ID is generated client-side.
func CreateNote(c *gin.Context) {
	var note models.Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if note.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}
	if err := database.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"note": note})
}

// UpdateNote updates an existing note.
func UpdateNote(c *gin.Context) {
	id := c.Param("id")
	var existing models.Note
	if err := database.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}

	var update models.Note
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	existing.Title = update.Title
	existing.Tags = update.Tags
	existing.Content = update.Content
	existing.UpdatedAt = update.UpdatedAt

	database.DB.Save(&existing)
	c.JSON(http.StatusOK, gin.H{"note": existing})
}

// DeleteNote deletes a note by ID.
func DeleteNote(c *gin.Context) {
	id := c.Param("id")
	result := database.DB.Where("id = ?", id).Delete(&models.Note{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": id})
}

// UpdateQuestion updates a question's fields by ID.
func UpdateQuestion(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}

	var existing models.Question
	if err := database.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
		return
	}

	var update models.QuestionUpdate
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

	database.DB.Save(&existing)
	c.JSON(http.StatusOK, gin.H{"question": existing})
}

// ──────────────────────────────────────────────
// Category metadata handlers
// ──────────────────────────────────────────────

// ListCategoryMetas returns all category metadata from the database.
func ListCategoryMetas(c *gin.Context) {
	var metas []models.CategoryMeta
	database.DB.Order("key").Find(&metas)
	c.JSON(http.StatusOK, gin.H{"category_metas": metas})
}

// UpdateCategoryMeta creates or updates category metadata (name + icon).
func UpdateCategoryMeta(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var input models.CategoryMeta
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	input.Key = key

	// Upsert: update if exists, create if not
	var existing models.CategoryMeta
	if err := database.DB.Where("key = ?", key).First(&existing).Error; err != nil {
		// Create new
		database.DB.Create(&input)
	} else {
		// Update existing
		existing.Name = input.Name
		existing.Icon = input.Icon
		database.DB.Save(&existing)
		input = existing
	}

	c.JSON(http.StatusOK, gin.H{"category_meta": input})
}

// ListIcons returns the list of available emoji icons for categories.
func ListIcons(c *gin.Context) {
	icons := []string{
		"☕", "🐹", "🤖", "🐳", "🐍", "💻", "🎯", "🔧",
		"⚙️", "🚀", "💡", "📦", "🗄️", "🌐", "🔒", "🛡️",
		"📊", "🎨", "🧩", "🔬", "📱", "🖥️", "🗃️", "⚛️",
		"🦀", "🐘", "🍃", "🔥", "☁️", "🏗️", "📝", "🧪",
		"⭐", "🎮", "🧠", "💾", "🔗", "📡", "🛠️", "🌀",
		"📋", "✅", "🎵", "🧰", "🪄", "🎪", "🔮", "💎",
	}
	c.JSON(http.StatusOK, gin.H{"icons": icons})
}

func init() {
	// Ensure JSON helpers are available
	_ = json.Valid
}
