import api from './axios';
import type { Schedule, ScheduleFormData, ApiResponse, PaginatedResponse } from '../types';

export const schedulesApi = {
    // Customer - get available schedules
    getAvailable: async (params?: { date?: string }): Promise<ApiResponse<Schedule[]>> => {
        const response = await api.get<ApiResponse<Schedule[]>>('/customer/schedules', { params });
        return response.data;
    },

    // Admin - get all schedules with pagination
    getAll: async (params?: { date?: string; status?: string; upcoming?: boolean; page?: number }): Promise<PaginatedResponse<Schedule>> => {
        const response = await api.get<PaginatedResponse<Schedule>>('/admin/schedules', { params });
        return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Schedule>> => {
        const response = await api.get<ApiResponse<Schedule>>(`/admin/schedules/${id}`);
        return response.data;
    },

    create: async (data: ScheduleFormData): Promise<ApiResponse<Schedule>> => {
        const response = await api.post<ApiResponse<Schedule>>('/admin/schedules', data);
        return response.data;
    },

    update: async (id: number, data: Partial<ScheduleFormData>): Promise<ApiResponse<Schedule>> => {
        const response = await api.put<ApiResponse<Schedule>>(`/admin/schedules/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/admin/schedules/${id}`);
        return response.data;
    },
};
