package dto

type PageQuery struct {
	Page     int `json:"page" form:"page"`
	PageSize int `json:"pageSize" form:"pageSize"` // 每页数量
}
