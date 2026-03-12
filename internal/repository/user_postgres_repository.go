package repository

import (
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}
func (r *userRepository) Create(user *model.User) error {

	return r.db.Create(user).Error
}
func (r *userRepository) FindByEmail(email string) (*model.User, error) {

	var user model.User

	err := r.db.
		Where("email = ?", email).
		First(&user).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}
