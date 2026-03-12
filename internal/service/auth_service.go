package service

import (
	"errors"

	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/LuuDinhTheTai/tzone/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// auth
type AuthService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) *AuthService {
	return &AuthService{userRepo}
}

// register
func (s *AuthService) Register(email string, password string) error {

	// check email tồn tại
	existing, _ := s.userRepo.FindByEmail(email)
	if existing != nil {
		return errors.New("email already exists")
	}

	// hash password
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return err
	}

	user := model.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: string(hash),
	}

	return s.userRepo.Create(&user)
}

// login
func (s *AuthService) Login(email string, password string) (*model.User, error) {

	user, err := s.userRepo.FindByEmail(email)

	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	)

	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	return user, nil
}
