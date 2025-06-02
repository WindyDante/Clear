package services

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/repository"
	"clear/internal/vo"
	"clear/pkg"
	"errors"
)

func UpdateTheme(userId, theme string) error {
	if theme == "" {
		return errors.New(models.ThemeEmptyMessage)
	}

	if err := repository.UpdateTheme(userId, theme); err != nil {
		return errors.New(err.Error())
	}

	return nil
}

func Status(userId string) (vo.UserStatusVo, error) {
	var err error
	var numOfDone, numOfUndone int64
	numOfDone, err = repository.Status(userId, models.TodoStatusPending)
	if err != nil {
		return vo.UserStatusVo{}, err
	}

	numOfUndone, err = repository.Status(userId, models.TodoStatusCompleted)
	if err != nil {
		return vo.UserStatusVo{}, err
	}

	return vo.UserStatusVo{
		NumofDone:   numOfDone,
		Numofundone: numOfUndone,
	}, nil

}

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
