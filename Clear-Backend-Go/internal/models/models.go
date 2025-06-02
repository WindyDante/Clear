package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string    `gorm:"primaryKey;size:50" json:"id"`
	Username  string    `gorm:"size:50" json:"username"`
	Password  string    `gorm:"size:100" json:"password"`
	Email     string    `gorm:"size:30" json:"email"`
	Theme     int       `json:"theme"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// User 创建前自动生成 UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

type Category struct {
	ID        string    `gorm:"primaryKey;size:50" json:"id"`
	Name      string    `gorm:"size:50" json:"name"`
	UserId    string    `gorm:"size:50" json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Category 创建前自动生成 UUID
func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
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

// Todo 创建前自动生成 UUID
func (t *Todo) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

type Cliams struct {
	Userid   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}
