package controllers

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/services"
	"clear/pkg"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategorys(c *gin.Context) {
	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	categories, err := services.GetCategoriesByUserId(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(categories, models.CategoryListMessage))
}
