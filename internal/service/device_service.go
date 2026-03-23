package service

import (
	"context"
	"fmt"
	"log"

	"github.com/LuuDinhTheTai/tzone/internal/dto"
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/LuuDinhTheTai/tzone/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// BrandUpdater interface defines the functions that DeviceService needs from Brand
type BrandUpdater interface {
	AddDeviceToBrand(ctx context.Context, brandID string, device *model.Device) error
	UpdateDeviceInBrand(ctx context.Context, brandID string, device *model.Device) error
	RemoveDeviceFromBrand(ctx context.Context, brandID string, deviceID string) error
}

type DeviceService struct {
	mongoDbRepo  *repository.DeviceRepository
	brandUpdater BrandUpdater
}

func NewDeviceService(mongoDbRepo *repository.DeviceRepository, brandUpdater BrandUpdater) *DeviceService {
	return &DeviceService{
		mongoDbRepo:  mongoDbRepo,
		brandUpdater: brandUpdater,
	}
}

// CreateDevice creates a new device
func (s *DeviceService) CreateDevice(ctx context.Context, req dto.CreateDeviceRequest) (*dto.DeviceResponse, error) {
	log.Printf("🔄 Creating device: %s", req.ModelName)

	brandID, err := bson.ObjectIDFromHex(req.BrandID)
	if err != nil {
		return nil, fmt.Errorf("invalid brand ID format %w", err)
	}

	device := &model.Device{
		BrandID:        brandID,
		ModelName:      req.ModelName,
		ImageUrl:       req.ImageUrl,
		Specifications: req.Specifications,
	}

	createdDevice, err := s.mongoDbRepo.CreateDevice(ctx, device)
	if err != nil {
		return nil, fmt.Errorf("failed to create device: %w", err)
	}

	err = s.brandUpdater.AddDeviceToBrand(ctx, req.BrandID, createdDevice)
	if err != nil {
		return nil, fmt.Errorf("failed to add device to brand: %w", err)
	}

	response := &dto.DeviceResponse{
		ID:             createdDevice.ID.Hex(),
		BrandID:        createdDevice.BrandID.Hex(),
		ModelName:      createdDevice.ModelName,
		ImageUrl:       createdDevice.ImageUrl,
		Specifications: createdDevice.Specifications,
	}

	log.Printf("✅ Device created successfully: %s", response.ModelName)
	return response, nil
}

// GetDeviceById retrieves a device by ID
func (s *DeviceService) GetDeviceById(ctx context.Context, id string) (*dto.DeviceResponse, error) {
	log.Printf("🔄 Fetching device with ID: %s", id)

	device, err := s.mongoDbRepo.GetDeviceById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get device: %w", err)
	}

	response := &dto.DeviceResponse{
		ID:             device.ID.Hex(),
		BrandID:        device.BrandID.Hex(),
		ModelName:      device.ModelName,
		ImageUrl:       device.ImageUrl,
		Specifications: device.Specifications,
	}

	return response, nil
}

// GetAllDevices retrieves all devices
func (s *DeviceService) GetAllDevices(ctx context.Context) (*dto.DeviceListResponse, error) {
	log.Printf("🔄 Fetching all devices")

	devices, err := s.mongoDbRepo.GetAllDevices(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all devices: %w", err)
	}

	var deviceResponses []dto.DeviceResponse
	for _, device := range devices {
		deviceResponses = append(deviceResponses, dto.DeviceResponse{
			ID:             device.ID.Hex(),
			BrandID:        device.BrandID.Hex(),
			ModelName:      device.ModelName,
			ImageUrl:       device.ImageUrl,
			Specifications: device.Specifications,
		})
	}

	response := &dto.DeviceListResponse{
		Devices: deviceResponses,
		Total:   len(deviceResponses),
	}

	log.Printf("✅ Retrieved %d devices", response.Total)
	return response, nil
}

// UpdateDevice updates existing device and handles brand changing
func (s *DeviceService) UpdateDevice(ctx context.Context, id string, req dto.UpdateDeviceRequest) (*dto.DeviceResponse, error) {
	log.Printf("🔄 Updating device with ID: %s", id)

	// Get old information to check brandID
	oldDevice, err := s.mongoDbRepo.GetDeviceById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("device not found: %w", err)
	}

	newBrandID, err := bson.ObjectIDFromHex(req.BrandID)
	if err != nil {
		return nil, fmt.Errorf("invalid brand ID format %w", err)
	}

	deviceToUpdate := &model.Device{
		BrandID:        newBrandID,
		ModelName:      req.ModelName,
		Specifications: req.Specifications,
	}

	updatedDevice, err := s.mongoDbRepo.UpdateDevice(ctx, id, deviceToUpdate)
	if err != nil {
		return nil, fmt.Errorf("failed to update device: %w", err)
	}

	// Process array data inside brand
	oldBrandHex := oldDevice.BrandID.Hex()
	if oldBrandHex != req.BrandID {
		// Remove device from old brand
		if err := s.brandUpdater.RemoveDeviceFromBrand(ctx, oldBrandHex, updatedDevice.ID.Hex()); err != nil {
			return nil, fmt.Errorf("failed to remove device from old brand: %w", err)
		}
		// Add a device to new brand
		if err := s.brandUpdater.AddDeviceToBrand(ctx, req.BrandID, updatedDevice); err != nil {
			return nil, fmt.Errorf("failed to add device to new brand: %w", err)
		}
	} else {
		// Only update information in the current brand
		if err := s.brandUpdater.UpdateDeviceInBrand(ctx, req.BrandID, updatedDevice); err != nil {
			return nil, fmt.Errorf("failed to update device in brand doc: %w", err)
		}
	}

	response := &dto.DeviceResponse{
		ID:             updatedDevice.ID.Hex(),
		BrandID:        updatedDevice.BrandID.Hex(),
		ModelName:      updatedDevice.ModelName,
		ImageUrl:       updatedDevice.ImageUrl,
		Specifications: updatedDevice.Specifications,
	}

	log.Printf("✅ Brand updated successfully: %s", response.ModelName)
	return response, nil
}

// DeleteDevice deletes a device by ID
func (s *DeviceService) DeleteDevice(ctx context.Context, id string) error {
	log.Printf("🔄 Deleting device with ID: %s", id)

	// Get the device before erasing to get the brandID
	device, err := s.mongoDbRepo.GetDeviceById(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to find device before deleting: %w", err)
	}

	err = s.mongoDbRepo.DeleteDevice(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete device: %w", err)
	}

	// Remove device from brand's array
	err = s.brandUpdater.RemoveDeviceFromBrand(ctx, device.BrandID.Hex(), id)
	if err != nil {
		return fmt.Errorf("failed to remove deleted device from brand: %w", err)
	}

	log.Printf("✅ Device deleted successfully")
	return nil
}
