package service

import (
	"github.com/LuuDinhTheTai/tzone/internal/repository"
)

type BrandService struct {
	mongoDbRepo *repository.DeviceRepository
}

func NewBrandService(mongoDbRepo *repository.DeviceRepository) *BrandService {
	return &BrandService{
		mongoDbRepo: mongoDbRepo,
	}
}
