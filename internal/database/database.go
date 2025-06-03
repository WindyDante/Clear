package database

import (
	"clear/config"
	"clear/internal/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	// 读取数据库类型和路径
	dbType := config.Config.DataBase.Type
	dbPath := config.Config.DataBase.Path

	// 确保数据库目录存在
	dir := fmt.Sprintf("%s", dbPath[:len(dbPath)-len("clear.db")]) // 提取目录
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		log.Fatalf(models.DirCreateErrorMessage+": %v", err)
		return err
	}

	var err error
	switch dbType {
	case "sqlite":
		// 初始化 SQLite 数据库
		DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	default:
		log.Fatalf(models.DatabaseTypeError+": %s", dbType)
		return err
	}

	if err != nil {
		log.Fatalf(models.DatabaseConnectError+": %v", err)
		return err
	}

	if err = models.MigrateDB(DB); err != nil {
		log.Fatal(models.DatabaseMigrateError+": %v", err)
	}

	return nil
}
