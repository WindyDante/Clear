package repository

import (
	"clear/internal/database"
	"clear/internal/models"
)

func Status(userId string, todoStatus int) (int64, error) {
	var status int64
	err := database.DB.Model(&models.Todo{}).
		Where("user_id = ?", userId).Where("status = ?", models.TodoStatusPending).
		Count(&status).Error
	if err != nil {
		return 0, err
	}
	return status, nil
}

func CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

func GetUserByUsername(username string) (models.User, error) {
	user := models.User{}
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}
