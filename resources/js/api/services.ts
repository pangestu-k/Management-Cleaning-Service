import api from './axios';
import type { Service, ServiceFormData, ApiResponse, PaginatedResponse } from '../types';

export const servicesApi = {
    // Public - get active services
    getPublicServices: async (): Promise<ApiResponse<Service[]>> => {
        const response = await api.get<ApiResponse<Service[]>>('/services');
        return response.data;
    },

    // Admin - get all services with pagination
    getAll: async (params?: { search?: string; status?: string; page?: number }): Promise<PaginatedResponse<Service>> => {
        const response = await api.get<PaginatedResponse<Service>>('/admin/services', { params });
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Service>> => {
        const response = await api.get<ApiResponse<Service>>(`/admin/services/${id}`);
        return response.data;
    },

    create: async (data: ServiceFormData): Promise<ApiResponse<Service>> => {
        const response = await api.post<ApiResponse<Service>>('/admin/services', data);
        return response.data;
    },

    update: async (id: number, data: Partial<ServiceFormData>): Promise<ApiResponse<Service>> => {
        const response = await api.put<ApiResponse<Service>>(`/admin/services/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/admin/services/${id}`);
        return response.data;
    },
};
