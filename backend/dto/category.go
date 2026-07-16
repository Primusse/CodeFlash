package dto

// CategoryInfo 分类信息（含题目数和进度统计）
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

// CategoryStats 分类答题统计
type CategoryStats struct {
	Category    string `json:"category"`
	Total       int64  `json:"total"`
	Correct     int64  `json:"correct"`
	Wrong       int64  `json:"wrong"`
	ProgressPct int    `json:"progress_pct"`
}

// StatsResponse 全局统计响应
type StatsResponse struct {
	TotalAnswered int64           `json:"total_answered"`
	TotalCorrect  int64           `json:"total_correct"`
	Accuracy      float64         `json:"accuracy"`
	Categories    []CategoryStats `json:"categories"`
}
