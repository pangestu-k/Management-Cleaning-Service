import api from './axios';
import type { Cleaner, CleanerFormData, ApiResponse, PaginatedResponse } from '../types';

export const cleanersApi = {
    getAll: async (params?: { search?: string; status?: string; page?: number }): Promise<PaginatedResponse<Cleaner>> => {
        const response = await api.get<PaginatedResponse<Cleaner>>('/admin/cleaners', { params });
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Cleaner>> => {
        const response = await api.get<ApiResponse<Cleaner>>(`/admin/cleaners/${id}`);
        return response.data;
    },

    create: async (data: CleanerFormData): Promise<ApiResponse<Cleaner>> => {
        const response = await api.post<ApiResponse<Cleaner>>('/admin/cleaners', data);
        return response.data;
    },

    update: async (id: number, data: Partial<CleanerFormData>): Promise<ApiResponse<Cleaner>> => {
        const response = await api.put<ApiResponse<Cleaner>>(`/admin/cleaners/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/admin/cleaners/${id}`);
        return response.data;
    },
};
