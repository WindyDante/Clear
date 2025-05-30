package models

import "time"

type User struct {
	ID        string    `gorm:"primaryKey;size:50" json:"id"`
	Username  string    `gorm:"size:50" json:"username"`
	Password  string    `gorm:"size:100" json:"password"`
	Email     string    `gorm:"size:30" json:"email"`
	Theme     int       `json:"theme"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Category struct {
	ID        string    `gorm:"primaryKey;size:50" json:"id"`
	Name      string    `gorm:"size:50" json:"name"`
	UserId    string    `gorm:"size:50" json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Todo struct {
	ID         string    `gorm:"primaryKey;size:50" json:"id"`
	Title      string    `gorm:"size:50" json:"title"`
	Content    string    `gorm:"size:255" json:"content"`
	Status     int       `gorm:"default:0" json:"status"` // 0: pending, 1: completed
	CategoryId string    `gorm:"size:50" json:"categoryId"`
	UserId     string    `gorm:"size:50" json:"userId"`
	DueDate    time.Time `json:"dueDate"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}
