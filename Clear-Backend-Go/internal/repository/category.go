package repository

import (
	"clear/internal/database"
	"clear/internal/models"
)

// Repository 层：返回 models
func GetCategoriesByUserId(userId string) ([]*models.Category, error) {
	var categories []*models.Category
	err := database.DB.Where("user_id = ?", userId).Find(&categories).Error
	if err != nil {
		return nil, err
	}
	return categories, nil
}
