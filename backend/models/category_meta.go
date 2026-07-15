package models

// CategoryMeta stores display name and icon for a category key.
type CategoryMeta struct {
	Key  string `json:"key" gorm:"primaryKey"`
	Name string `json:"name"`
	Icon string `json:"icon"`
}
