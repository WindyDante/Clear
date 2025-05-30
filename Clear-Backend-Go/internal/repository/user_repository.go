package repository

import (
	"clear/internal/database"
	"clear/internal/models"
)

func GetUserByUsername(username string) (models.User, error) {
	user := models.User{}
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}
