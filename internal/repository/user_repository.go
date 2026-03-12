package repository

import "github.com/LuuDinhTheTai/tzone/internal/model"

type UserRepository interface {
	Create(user *model.User) error
	FindByEmail(email string) (*model.User, error)
}
