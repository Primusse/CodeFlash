package repository

import (
	"codeflash/database"
	"codeflash/models"
)

// 默认分类元数据（数据库中没有时的兜底）
var defaultCategoryMeta = map[string]struct {
	Name string
	Icon string
}{
	"java":   {Name: "Java 后端开发", Icon: "☕"},
	"golang": {Name: "Go 后端开发", Icon: "🐹"},
	"agent":  {Name: "AI Agent 开发", Icon: "🤖"},
	"docker": {Name: "Docker 容器技术", Icon: "🐳"},
}

// GetCategoryMeta 获取分类元数据（优先查 DB，没有则用默认值）
func GetCategoryMeta(key string) models.CategoryMeta {
	var m models.CategoryMeta
	if err := database.DB.Where("key = ?", key).First(&m).Error; err == nil {
		return m
	}
	if d, ok := defaultCategoryMeta[key]; ok {
		return models.CategoryMeta{Key: key, Name: d.Name, Icon: d.Icon}
	}
	return models.CategoryMeta{Key: key, Name: key, Icon: "📦"}
}

// GetCategoryName 获取分类显示名
func GetCategoryName(key string) string {
	return GetCategoryMeta(key).Name
}

// GetCategoryIcon 获取分类图标
func GetCategoryIcon(key string) string {
	return GetCategoryMeta(key).Icon
}

// ListCategoryMetas 获取所有分类元数据
func ListCategoryMetas() []models.CategoryMeta {
	var metas []models.CategoryMeta
	database.DB.Order("key").Find(&metas)
	return metas
}

// UpsertCategoryMeta 创建或更新分类元数据
func UpsertCategoryMeta(key, name, icon string) models.CategoryMeta {
	var existing models.CategoryMeta
	input := models.CategoryMeta{Key: key, Name: name, Icon: icon}

	if err := database.DB.Where("key = ?", key).First(&existing).Error; err != nil {
		database.DB.Create(&input)
		return input
	}

	existing.Name = name
	existing.Icon = icon
	database.DB.Save(&existing)
	return existing
}
