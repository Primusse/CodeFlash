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
	Icon          string `json:"icon"`
	TotalCount    int64  `json:"total_count"`
	ChoiceCount   int64  `json:"choice_count"`
	FillCount     int64  `json:"fill_count"`
	AnsweredCount int64  `json:"answered_count"`
	CorrectCount  int64  `json:"correct_count"`
}

// QuestionUpdate represents the fields that can be updated on a question.
type QuestionUpdate struct {
	Question    string `json:"question"`
	Subcategory string `json:"subcategory"`
	Difficulty  string `json:"difficulty"`
	Type        string `json:"type"`
	Options     string `json:"options"`
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
	Category    string `json:"category"`
}
