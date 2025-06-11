package controllers

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/services"
	"clear/pkg"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func UpdatePwd(c *gin.Context) {
	var updatePwd dto.PwdUpdateRequest
	if c.ShouldBindBodyWithJSON(&updatePwd) != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidRequestBodyMessage))
		return
	}

	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	err = services.UpdatePwd(userId, updatePwd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.UpdatePwdSuccessMessage))
}

func UpdateTheme(c *gin.Context) {
	themeStr := c.Param("theme")
	theme, err := strconv.Atoi(themeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidThemeMessage))
		return
	}

	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	err = services.UpdateTheme(userId, theme)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.UpdateThemeSuccessMessage))
}

func SendMail(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.EmailRequiredMessage))
		return
	}
	// TODO: 实现发送邮件逻辑
	c.JSON(http.StatusOK, dto.OK(models.MethodDevelopmentErrorMessage))
}

func CheckEmail(c *gin.Context) {
	email, code := c.Param("email"), c.Param("code")
	if email == "" || code == "" {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.EmailOrCodeRequiredMessage))
		return
	}
	// TODO: 实现验证邮件逻辑
	c.JSON(http.StatusOK, dto.OK(models.MethodDevelopmentErrorMessage))
}

func UserStatus(c *gin.Context) {
	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	Status, err := services.Status(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(Status, models.UserStatusMessage))
}
