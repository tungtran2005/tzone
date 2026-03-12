package repository

import "gorm.io/gorm"

type PostgreRepository struct {
	DB *gorm.DB
}

func NewPostgreRepository(db *gorm.DB) *PostgreRepository {
	return &PostgreRepository{
		DB: db,
	}
}
