package repository

import (
	"clear/internal/database"
	"clear/internal/models"
)

func UpdatePwd(password, userId string) error {
	return database.DB.Model(&models.User{}).
		Where("id = ?", userId).
		Updates(models.User{
			Password: password}).Error
}

func GetPwdByUserId(userId string) (string, error) {
	var password string
	err := database.DB.Model(&models.User{}).
		Select("password").
		Where("id = ?", userId).
		Scan(&password).Error
	return password, err
}

func UpdateTheme(userId string, theme int) error {
	return database.DB.Model(&models.User{}).
		Where("id = ?", userId).
		Updates(models.User{
			Theme: theme,
		}).Error
}

func Status(userId string, todoStatus int) (int64, error) {
	var status int64
	err := database.DB.Model(&models.Todo{}).
		Where("user_id = ?", userId).Where("status = ?", todoStatus).
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
