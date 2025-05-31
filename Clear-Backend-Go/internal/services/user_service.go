package services

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/repository"
	"clear/internal/vo"
	"clear/pkg"
	"errors"
)

func Register(userdto dto.RegisterDto) (vo.LoginVo, error) {
	// 使用零值而不是声明变量
	if userdto.Username == "" || userdto.Password == "" {
		return vo.LoginVo{}, errors.New(models.UsernameOrPasswordEmptyMessage)
	}

	user, err := repository.GetUserByUsername(userdto.Username)
	if err == nil && user.ID != "0" {
		return vo.LoginVo{}, errors.New(models.UserExistMessage)
	}

	// 将密码进行md5加密
	userdto.Password = pkg.MD5Encrypt(userdto.Password)

	newUser := models.User{
		Username: userdto.Username,
		Password: userdto.Password,
	}

	if err := repository.CreateUser(&newUser); err != nil {
		return vo.LoginVo{}, errors.New(models.SystemErrorMessage)
	}

	tk, err := pkg.GenerateToken(pkg.CreateClaims(newUser))
	if err != nil {
		return vo.LoginVo{}, errors.New(models.GenerateTokenErrorMessage)
	}

	return vo.LoginVo{
		Id:       newUser.ID,
		Username: newUser.Username,
		Tk:       tk,
		Theme:    newUser.Theme,
	}, nil
}

func Login(userdto dto.LoginDto) (vo.LoginVo, error) {
	// 使用零值而不是声明变量
	if userdto.Username == "" || userdto.Password == "" {
		return vo.LoginVo{}, errors.New(models.UsernameOrPasswordEmptyMessage)
	}

	// 将密码进行md5加密
	userdto.Password = pkg.MD5Encrypt(userdto.Password)

	user, err := repository.GetUserByUsername(userdto.Username)
	if err != nil {
		return vo.LoginVo{}, errors.New(models.UserNotFoundMessage)
	}

	if user.Password != userdto.Password {
		return vo.LoginVo{}, errors.New(models.PasswordErrorMessage)
	}

	tk, err := pkg.GenerateToken(pkg.CreateClaims(user))
	if err != nil {
		return vo.LoginVo{}, errors.New(models.GenerateTokenErrorMessage)
	}

	return vo.LoginVo{
		Id:       user.ID,
		Username: user.Username,
		Tk:       tk,
		Theme:    user.Theme,
	}, nil
}
