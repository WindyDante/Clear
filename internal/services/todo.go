package services

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/repository"
	"clear/internal/vo"
	"errors"
	"time"
)

func DelTodo(todoId string) error {
	return repository.DeleteTodo(todoId)
}

func CreateOrUpdateTodo(userId string, dueDate time.Time, todoCreateDto dto.TodoCreateDto) error {
	todo := models.Todo{
		UserId:     userId,
		Status:     todoCreateDto.Status,
		CategoryId: todoCreateDto.CategoryId,
		Title:      todoCreateDto.Title,
		Content:    todoCreateDto.Content,
		DueDate:    dueDate,
	}
	if todoCreateDto.Id == "" {
		if todoCreateDto.CategoryId == "" {
			return errors.New(models.CategoryIdNotExistsMessage)
		}
		if todoCreateDto.Title == "" {
			return errors.New(models.TodoTitleNotEmptyMessage)
		}
		// Create new todo
		err := repository.CreateTodo(&todo)
		if err != nil {
			return err
		}
	} else {
		// Update existing todo
		err := repository.UpdateTodo(todoCreateDto.Id, &todo)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetTodoList(userId string, TodoQueryDto dto.TodoQueryDto) (vo.PgaeResult[vo.TodoVo], error) {
	if TodoQueryDto.Page < 1 {
		TodoQueryDto.Page = 1
	}
	if TodoQueryDto.PageSize < 1 || TodoQueryDto.PageSize > 100 {
		TodoQueryDto.PageSize = 100
	}

	todoListVo, err := repository.PageTodo(userId, TodoQueryDto)
	return todoListVo, err
}
