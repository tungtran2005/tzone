import client from './client';
import type {
  ApiResponse,
  Device,
  DeviceListResponse,
  CreateDeviceRequest,
  UpdateDeviceRequest,
} from '../types';

const buildDeviceFormData = (data: CreateDeviceRequest | UpdateDeviceRequest) => {
  const formData = new FormData();
  formData.append('brand_id', data.brand_id);
  formData.append('model_name', data.model_name);
  formData.append('specifications', JSON.stringify(data.specifications || {}));

  if (data.image) {
    formData.append('image', data.image);
  }

  return formData;
};

export const devicesApi = {
  getAll: (page = 1, limit = 10) =>
    client.get<ApiResponse<DeviceListResponse>>('/api/v1/devices', {
      params: { page, limit },
    }),

  search: (name: string, page = 1, limit = 10) =>
    client.get<ApiResponse<DeviceListResponse>>('/api/v1/devices/search', {
      params: { name, page, limit },
    }),

  getById: (id: string) =>
    client.get<ApiResponse<Device>>(`/api/v1/devices/${id}`),

  getByBrandId: (brandId: string, page = 1, limit = 10) =>
    client.get<ApiResponse<DeviceListResponse>>(`/api/v1/devices/brand/${brandId}`, {
      params: { page, limit },
    }),

  create: (data: CreateDeviceRequest) =>
    client.post<ApiResponse<Device>>('/api/v1/devices', buildDeviceFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: UpdateDeviceRequest) =>
    client.put<ApiResponse<Device>>(`/api/v1/devices/${id}`, buildDeviceFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    client.delete<ApiResponse>(`/api/v1/devices/${id}`),
};
