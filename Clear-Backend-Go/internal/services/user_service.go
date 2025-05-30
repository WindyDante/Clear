package services

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/repository"
	"clear/pkg"
	"errors"
)

func Login(userdto dto.LoginDto) (string, error) {
	if userdto.Username == "" || userdto.Password == "" {
		return "", errors.New(models.UsernameOrPasswordEmptyMessage)
	}
	// 将密码进行md5加密
	userdto.Password = pkg.MD5Encrypt(userdto.Password)

	user, err := repository.GetUserByUsername(userdto.Username)

	if err != nil {
		return "", errors.New(models.UserNotFoundMessage)
	}
	if user.Password != userdto.Password {
		return "", errors.New(models.PasswordErrorMessage)
	}

	token, err := pkg.GenerateToken(pkg.CreateClaims(user))
	if err != nil {
		return "", errors.New(models.GenerateTokenErrorMessage)
	}

	return token, nil
}
