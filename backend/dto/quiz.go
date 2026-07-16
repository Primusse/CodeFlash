package dto

// QuizStartRequest 开始答题请求
type QuizStartRequest struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
	Type     string `json:"type"` // "all", "choice", "fill"
}

// SubmitAnswer 提交答案请求
type SubmitAnswer struct {
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
}

// QuizResult 单题答题结果
type QuizResult struct {
	Correct bool   `json:"correct"`
	Answer  string `json:"answer"`
	Explain string `json:"explain"`
}

// SafeQuestion 不含答案的题目（返回给前端答题用）
type SafeQuestion struct {
	ID          string `json:"id"`
	Category    string `json:"category"`
	Subcategory string `json:"subcategory"`
	Type        string `json:"type"`
	Difficulty  string `json:"difficulty"`
	Question    string `json:"question"`
	Options     string `json:"options"`
}

// BatchResult 批量答题中单题结果
type BatchResult struct {
	QuestionID  string `json:"question_id"`
	Correct     bool   `json:"correct"`
	YourAnswer  string `json:"your_answer"`
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
}

// QuizBatchResponse 批量答题响应
type QuizBatchResponse struct {
	Results  []BatchResult `json:"results"`
	Correct  int           `json:"correct"`
	Total    int           `json:"total"`
	Accuracy float64       `json:"accuracy"`
}
