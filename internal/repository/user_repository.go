package repository

import (
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User, roleName string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		var role model.Role
		if err := tx.Where("name = ?", roleName).First(&role).Error; err != nil {
			return err
		}

		userRole := model.UserRole{
			UserID: user.ID,
			RoleID: role.ID,
		}

		if err := tx.Create(&userRole).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *UserRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
