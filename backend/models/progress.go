package models

// Progress 答题进度记录
type Progress struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	QuestionID string `json:"question_id"`
	Category   string `json:"category"`
	Correct    bool   `json:"correct"`
	AnsweredAt int64  `json:"answered_at"` // Unix 时间戳
}
