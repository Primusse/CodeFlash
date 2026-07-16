package handlers

import (
	"codeflash/models"
	"codeflash/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ListNotes 获取笔记列表
func ListNotes(c *gin.Context) {
	notes := repository.ListNotes()
	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

// CreateNote 创建笔记
func CreateNote(c *gin.Context) {
	var note models.Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if note.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
		return
	}
	if err := repository.CreateNote(&note); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"note": note})
}

// UpdateNote 更新笔记
func UpdateNote(c *gin.Context) {
	id := c.Param("id")
	existing, err := repository.GetNoteByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}

	var update models.Note
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	existing.Title = update.Title
	existing.Tags = update.Tags
	existing.Content = update.Content

	repository.UpdateNote(existing)
	c.JSON(http.StatusOK, gin.H{"note": existing})
}

// DeleteNote 删除笔记
func DeleteNote(c *gin.Context) {
	id := c.Param("id")
	rows, err := repository.DeleteNote(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if rows == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted", "id": id})
}
