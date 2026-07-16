package models

// Question 题目数据库模型
type Question struct {
	ID          string `json:"id" gorm:"primaryKey"`
	Category    string `json:"category"`    // java, golang, agent, docker
	Subcategory string `json:"subcategory"` // jvm, concurrency, spring, etc.
	Type        string `json:"type"`        // "choice" | "fill"
	Difficulty  string `json:"difficulty"`  // easy, medium, hard
	Question    string `json:"question"`
	Options     string `json:"options"`     // JSON array string for choice questions
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
}
