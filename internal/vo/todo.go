package vo

import "time"

type TodoVo struct {
	ID           string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Title        string    `json:"title" gorm:"type:varchar(255);not null"`
	Content      string    `json:"content" gorm:"type:text"`
	Status       int       `json:"status" gorm:"type:int;default:0"`
	CategoryID   string    `json:"categoryId" gorm:"type:varchar(36)"`
	CategoryName string    `json:"categoryName" gorm:"type:varchar(255)"`
	DueDate      time.Time `json:"dueDate" gorm:"type:datetime"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}
