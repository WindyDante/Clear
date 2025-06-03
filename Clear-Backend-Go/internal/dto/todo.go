package dto

import "time"

type TodoCreateDto struct {
	Id         string `json:"id"`                            // 任务ID, 用于更新时传入
	CategoryId string `json:"categoryId" binding:"required"` // 分类ID
	Title      string `json:"title" binding:"required"`      // 任务标题
	Content    string `json:"content"`                       // 任务内容
	DueDate    string `json:"dueDate"`                       // 截止日期
	Status     int    `json:"status"`                        // 任务状态, 0:未完成, 1:已完成
}

type TodoQueryDto struct {
	PageQuery
	CategoryId string    `form:"categoryId" json:"categoryId"`
	Status     int       `form:"status" json:"status"`                                // 0:未完成, 1:已完成
	KeyWord    string    `form:"keyword" json:"keyword"`                              // 关键字
	StartDate  time.Time `form:"startDate" json:"startDate" time_format:"2006-01-02"` // 开始日期
	EndDate    time.Time `form:"endDate" json:"endDate" time_format:"2006-01-02"`     // 结束日期
}
