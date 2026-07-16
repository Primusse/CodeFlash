package handlers

import (
	"codeflash/models"
	"codeflash/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ListCategoryMetas 获取所有分类元数据
func ListCategoryMetas(c *gin.Context) {
	metas := repository.ListCategoryMetas()
	c.JSON(http.StatusOK, gin.H{"category_metas": metas})
}

// UpdateCategoryMeta 创建或更新分类元数据
func UpdateCategoryMeta(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	var input models.CategoryMeta
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	result := repository.UpsertCategoryMeta(key, input.Name, input.Icon)
	c.JSON(http.StatusOK, gin.H{"category_meta": result})
}

// ListIcons 获取可用的 emoji 图标列表
func ListIcons(c *gin.Context) {
	icons := []string{
		"☕", "🐹", "🤖", "🐳", "🐍", "💻", "🎯", "🔧",
		"⚙️", "🚀", "💡", "📦", "🗄️", "🌐", "🔒", "🛡️",
		"📊", "🎨", "🧩", "🔬", "📱", "🖥️", "🗃️", "⚛️",
		"🦀", "🐘", "🍃", "🔥", "☁️", "🏗️", "📝", "🧪",
		"⭐", "🎮", "🧠", "💾", "🔗", "📡", "🛠️", "🌀",
		"📋", "✅", "🎵", "🧰", "🪄", "🎪", "🔮", "💎",
	}
	c.JSON(http.StatusOK, gin.H{"icons": icons})
}
