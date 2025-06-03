package services

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/internal/repository"
	"clear/internal/vo"
	"errors"
)

func DelCategory(id string) error {
	if id == "" {
		return errors.New(models.CategoryIdNotExistsMessage)
	}
	err := repository.DelCategory(id)
	if err != nil {
		return err
	}

	// 删除分类后，删除该分类下的所有todo
	err = repository.DeleteTodoByCategoryId(id)
	if err != nil {
		return err
	}

	return nil
}

func CreateOrUpdateCategory(userId string, category dto.CategoryDto) error {
	if category.Name == "" {
		return errors.New(models.CategoryNameNotExistsMessage)
	}

	categoryList, err := repository.GetCategoriesByUserId(userId)

	if err != nil {
		return err
	}

	for _, existingCategory := range categoryList {
		if existingCategory.Name == category.Name {
			return errors.New(models.CategoryNameExistsMessage)
		}
	}

	// 新建
	if category.Id == "" {
		newCategory := models.Category{
			UserId: userId,
			Name:   category.Name,
		}
		err = repository.CreateCategory(newCategory)
		if err != nil {
			return err
		}

	} else {
		// 更新
		err = repository.UpdateCategory(category)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetCategoriesByUserId(userId string) ([]*vo.CategoryVo, error) {
	categories, err := repository.GetCategoriesByUserId(userId)
	if err != nil {
		return nil, err
	}
	var categoryVos []*vo.CategoryVo
	for _, category := range categories {
		categoryVos = append(categoryVos, &vo.CategoryVo{
			Id:           category.ID,
			CategoryName: category.Name,
		})
	}
	return categoryVos, nil
}
