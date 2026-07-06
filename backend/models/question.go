package models

type Question struct {
	ID          string `json:"id" gorm:"primaryKey"`
	Category    string `json:"category"`    // java, golang, agent
	Subcategory string `json:"subcategory"` // jvm, concurrency, spring, etc.
	Type        string `json:"type"`        // "choice" | "fill"
	Difficulty  string `json:"difficulty"`  // easy, medium, hard
	Question    string `json:"question"`
	Options     string `json:"options"`     // JSON array string for choice questions
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
}

type QuizSession struct {
	Questions []Question `json:"questions"`
	Current   int        `json:"current"`
	Total     int        `json:"total"`
}

type SubmitAnswer struct {
	QuestionID string `json:"question_id"`
	Answer     string `json:"answer"`
}

type QuizResult struct {
	Correct bool   `json:"correct"`
	Answer  string `json:"answer"`
	Explain string `json:"explain"`
}

type QuizStartRequest struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
	Type     string `json:"type"` // "all", "choice", "fill"
}
