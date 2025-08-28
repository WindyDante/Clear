package repository

import (
	"clear/internal/database"
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/vo"
	"errors"
	"time"

	"gorm.io/gorm"
)

func DeleteTodoByCategoryId(categoryId string) error {
	result := database.DB.Where("category_id = ?", categoryId).Delete(&models.Todo{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func DeleteTodo(id string) error {
	result := database.DB.Where("id = ?", id).Delete(&models.Todo{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New(models.TodoNotExistsMessage)
	}
	return nil
}

func UpdateTodo(id string, todo *models.Todo) error {
	result := database.DB.Where("id = ?", id).Updates(todo)
	if todo.Content == "" {
		if err := database.DB.Model(&models.Todo{}).
			Where("id = ?", id).
			Update("content", "").Error; err != nil {
			return err
		}
	}

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New(models.TodoNotExistsMessage)
	}
	return nil
}

func CreateTodo(todo *models.Todo) error {
	return database.DB.Create(todo).Error
}

func PageTodo(userId string, TodoQueryDto dto.TodoQueryDto) (vo.PgaeResult[vo.TodoVo], error) {
	var todos []*models.Todo
	var total int64

	// 基础查询
	query := database.DB.Model(&models.Todo{}).Where("user_id = ?", userId)

	// 动态构建查询条件
	query = buildTodoQueryConditions(query, TodoQueryDto)

	// 统计总数
	if err := query.Count(&total).Error; err != nil {
		return vo.PgaeResult[vo.TodoVo]{}, err
	}

	// 分页查询
	offset := (TodoQueryDto.Page - 1) * TodoQueryDto.PageSize
	if err := query.Order("created_at DESC").
		Limit(TodoQueryDto.PageSize).
		Offset(offset).
		Find(&todos).Error; err != nil {
		return vo.PgaeResult[vo.TodoVo]{}, err
	}
	// 转换为 VO
	todoVos, err := convertToTodoVos(todos)

	if err != nil {
		return vo.PgaeResult[vo.TodoVo]{}, err
	}

	// 构建分页结果
	result := vo.PgaeResult[vo.TodoVo]{
		Total:   total,
		Size:    TodoQueryDto.PageSize,
		Current: TodoQueryDto.Page,
		Records: todoVos,
	}

	return result, nil
}

// 构建查询条件的辅助函数
func buildTodoQueryConditions(query *gorm.DB, TodoQueryDto dto.TodoQueryDto) *gorm.DB {
	// 分类条件
	if TodoQueryDto.CategoryId != "" {
		query = query.Where("category_id = ?", TodoQueryDto.CategoryId)
	}

	// 状态条件：0 表示待办，1 表示已完成
	if TodoQueryDto.Status > 0 {
		query = query.Where("status = ?", TodoQueryDto.Status)
	}

	// 关键字搜索
	if TodoQueryDto.KeyWord != "" {
		keyword := "%" + TodoQueryDto.KeyWord + "%"
		query = query.Where(
			database.DB.Where("title LIKE ?", keyword).
				Or("content LIKE ?", keyword),
		)
	}

	// 开始日期
	if !TodoQueryDto.StartDate.IsZero() {
		query = query.Where("created_at >= ?", TodoQueryDto.StartDate)
	}

	// 结束日期
	if !TodoQueryDto.EndDate.IsZero() {
		endOfDay := TodoQueryDto.EndDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		query = query.Where("created_at <= ?", endOfDay)
	}

	return query
}

// 转换为 VO 的辅助函数
func convertToTodoVos(todos []*models.Todo) ([]vo.TodoVo, error) {
	todoVos := make([]vo.TodoVo, 0, len(todos))
	for _, todo := range todos {
		name, err := GetCategoryNameById(todo.CategoryId)
		if err != nil {
			return nil, err
		}
		todoVos = append(todoVos, vo.TodoVo{
			ID:           todo.ID,
			Title:        todo.Title,
			Content:      todo.Content,
			Status:       todo.Status,
			CategoryName: name,
			CategoryID:   todo.CategoryId,
			DueDate:      todo.DueDate,
			CreatedAt:    todo.CreatedAt,
			UpdatedAt:    todo.UpdatedAt,
		})
	}
	return todoVos, nil
}
