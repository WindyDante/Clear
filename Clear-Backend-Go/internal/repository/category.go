package repository

import (
	"clear/internal/database"
	"clear/internal/dto"
	"clear/internal/models"
)

// DelCategory 删除分类
func DelCategory(id string) error {
	return database.DB.Where("id = ?", id).Delete(&models.Category{}).Error
}

// UpdateCategory 更新分类
func UpdateCategory(category dto.CategoryDto) error {
	return database.DB.Model(&models.Category{}).Where("id = ?", category.Id).Updates(
		models.Category{
			Name: category.Name,
		},
	).Error
}

// CreateCategory 创建分类
func CreateCategory(category models.Category) error {
	if err := database.DB.Create(&category).Error; err != nil {
		return err
	}
	return nil
}

// Repository 层：返回 models
func GetCategoriesByUserId(userId string) ([]*models.Category, error) {
	var categories []*models.Category
	err := database.DB.Where("user_id = ?", userId).Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}
