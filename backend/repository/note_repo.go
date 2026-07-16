package repository

import (
	"codeflash/database"
	"codeflash/models"
	"time"
)

// ListNotes 获取所有笔记（按更新时间倒序）
func ListNotes() []models.Note {
	var notes []models.Note
	database.DB.Order("updated_at DESC").Find(&notes)
	return notes
}

// GetNoteByID 按 ID 查询笔记
func GetNoteByID(id string) (*models.Note, error) {
	var note models.Note
	if err := database.DB.Where("id = ?", id).First(&note).Error; err != nil {
		return nil, err
	}
	return &note, nil
}

// CreateNote 创建笔记（自动设置创建时间和更新时间）
func CreateNote(note *models.Note) error {
	now := time.Now().Unix()
	note.CreatedAt = now
	note.UpdatedAt = now
	return database.DB.Create(note).Error
}

// UpdateNote 更新笔记（自动更新更新时间）
func UpdateNote(note *models.Note) error {
	note.UpdatedAt = time.Now().Unix()
	return database.DB.Save(note).Error
}

// DeleteNote 删除笔记
func DeleteNote(id string) (int64, error) {
	result := database.DB.Where("id = ?", id).Delete(&models.Note{})
	return result.RowsAffected, result.Error
}
