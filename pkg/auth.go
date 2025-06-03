package pkg

import (
	"errors"

	"github.com/gin-gonic/gin"
)

func GetCurrentUserId(c *gin.Context) (string, error) {
	userId := c.GetString("userId")
	if userId == "" {
		return "", errors.New("用户未登录")
	}
	return userId, nil
}
