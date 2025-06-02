package services

import (
	"clear/internal/repository"
	"clear/internal/vo"
)

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
