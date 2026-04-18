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

// FindByEmailWithRole returns user with their role name
func (r *UserRepository) FindByEmailWithRole(email string) (*model.User, string, error) {
	var user model.User
	var role model.Role

	err := r.db.
		Joins("JOIN user_roles ON user_roles.user_id = users.id").
		Joins("JOIN roles ON roles.id = user_roles.role_id").
		Where("users.email = ?", email).
		Select("users.*").
		First(&user).Error

	if err != nil {
		return nil, "", err
	}

	// Get the role name
	err = r.db.
		Joins("JOIN user_roles ON user_roles.role_id = roles.id").
		Where("user_roles.user_id = ?", user.ID).
		First(&role).Error

	if err != nil {
		return nil, "", err
	}

	return &user, role.Name, nil
}
