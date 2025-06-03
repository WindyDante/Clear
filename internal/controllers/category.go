package controllers

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/services"
	"clear/pkg"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DelCategory(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.CategoryIdNotExistsMessage))
		return
	}
	err := services.DelCategory(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.CategorySuccessMessage))
}

func CreateOrUpdateCategory(c *gin.Context) {
	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	var category dto.CategoryDto
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidRequestBodyMessage))
		return
	}
	err = services.CreateOrUpdateCategory(userId, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.CategorySuccessMessage))
}

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
