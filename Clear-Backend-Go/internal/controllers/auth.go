package controllers

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	// 从请求体获取用户名和密码
	var user dto.LoginDto

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidRequestBodyMessage))
		return
	}

	// 调用服务层进行登录验证
	token, err := services.Login(user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.OK(token, models.LoginSuccessMessage))
}
