package controllers

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/services"
	"clear/pkg"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func DelTodo(c *gin.Context) {
	todoId := c.Param("id")
	if todoId == "" {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidParameterMessage))
		return
	}
	err := services.DelTodo(todoId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.TodoDeletedMessage))
}

func CreateOrUpdateTodo(c *gin.Context) {
	var todoCreateDto dto.TodoCreateDto

	if err := c.ShouldBindJSON(&todoCreateDto); err != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidRequestBodyMessage))
		return
	}

	var dueDate time.Time
	if todoCreateDto.DueDate != "" {
		var err error
		dueDate, err = time.Parse("2006-01-02 15:04:05", todoCreateDto.DueDate)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidParameterMessage))
			return
		}
	}

	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}

	err = services.CreateOrUpdateTodo(userId, dueDate, todoCreateDto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(models.TodoCreatedMessage))
}

func PageTodo(c *gin.Context) {
	var TodoQueryDto dto.TodoQueryDto

	if err := c.ShouldBindQuery(&TodoQueryDto); err != nil {
		c.JSON(http.StatusBadRequest, dto.Fail[string](models.InvalidParameterMessage))
		return
	}

	fmt.Println("todo:", TodoQueryDto)

	userId, err := pkg.GetCurrentUserId(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Fail[string](err.Error()))
		return
	}
	todoList, err := services.GetTodoList(userId, TodoQueryDto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Fail[string](err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(todoList))
}
