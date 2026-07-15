package models

type Note struct {
	ID        string `json:"id" gorm:"primaryKey"`
	Title     string `json:"title"`
	Tags      string `json:"tags"` // comma-separated tag string
	Content   string `json:"content"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}
