package dto

import "github.com/LuuDinhTheTai/tzone/internal/model"

// DeviceResponse represents the response structure for a device
type DeviceResponse struct {
	ID             string `json:"id"`
	ModelName      string `json:"model_name"`
	ImageUrl       string `json:"imageUrl"`
	Specifications model.Specifications
}

// DeviceListResponse represents the response structure for a list of devices
type DeviceListResponse struct {
	Devices []DeviceResponse `json:"devices"`
	Total   int              `json:"total"`
}
