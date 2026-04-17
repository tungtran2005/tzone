import client from './client';
import type {
  ApiResponse,
  Brand,
  BrandListResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../types';

export const brandsApi = {
  getAll: (page = 1, limit = 10) =>
    client.get<ApiResponse<BrandListResponse>>('/api/v1/brands', {
      params: { page, limit },
    }),

  search: (name: string, page = 1, limit = 10) =>
    client.get<ApiResponse<BrandListResponse>>('/api/v1/brands/search', {
      params: { name, page, limit },
    }),

  getById: (id: string) =>
    client.get<ApiResponse<Brand>>(`/api/v1/brands/${id}`),

  create: (data: CreateBrandRequest) =>
    client.post<ApiResponse<Brand>>('/api/v1/brands', data),

  update: (id: string, data: UpdateBrandRequest) =>
    client.put<ApiResponse<Brand>>(`/api/v1/brands/${id}`, data),

  delete: (id: string) =>
    client.delete<ApiResponse>(`/api/v1/brands/${id}`),
};
