package vo

type CategoryVo struct {
	Id           string `json:"id"`
	CategoryName string `json:"categoryName" binding:"required"`
}
