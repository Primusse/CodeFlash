package models

type Progress struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	QuestionID string `json:"question_id"`
	Category   string `json:"category"`
	Correct    bool   `json:"correct"`
	AnsweredAt int64  `json:"answered_at"`
}

type CategoryStats struct {
	Category    string `json:"category"`
	Total       int64  `json:"total"`
	Correct     int64  `json:"correct"`
	Wrong       int64  `json:"wrong"`
	ProgressPct int    `json:"progress_pct"`
}

type StatsResponse struct {
	TotalAnswered int64           `json:"total_answered"`
	TotalCorrect  int64           `json:"total_correct"`
	Accuracy      float64         `json:"accuracy"`
	Categories    []CategoryStats `json:"categories"`
}

type CategoryInfo struct {
	Category      string `json:"category"`
	Name          string `json:"name"`
	TotalCount    int64  `json:"total_count"`
	ChoiceCount   int64  `json:"choice_count"`
	FillCount     int64  `json:"fill_count"`
	AnsweredCount int64  `json:"answered_count"`
	CorrectCount  int64  `json:"correct_count"`
}
