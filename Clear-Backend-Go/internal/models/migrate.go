package models

import "gorm.io/gorm"

func MigrateDB(db *gorm.DB) error {
	err := db.AutoMigrate(&User{}, &Todo{}, &Category{})
	if err != nil {
		return err
	}
	return nil
}
