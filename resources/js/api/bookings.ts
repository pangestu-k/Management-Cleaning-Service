import api from './axios';
import type { Booking, BookingFormData, BookingStatus, ApiResponse, PaginatedResponse } from '../types';

export const bookingsApi = {
    // Customer endpoints
    customer: {
        getAll: async (params?: { status?: string; page?: number }): Promise<PaginatedResponse<Booking>> => {
            const response = await api.get<PaginatedResponse<Booking>>('/customer/bookings', { params });
            return response.data;
        },

        getById: async (id: number): Promise<ApiResponse<Booking>> => {
            const response = await api.get<ApiResponse<Booking>>(`/customer/bookings/${id}`);
            return response.data;
        },

        create: async (data: BookingFormData): Promise<ApiResponse<Booking>> => {
            const response = await api.post<ApiResponse<Booking>>('/customer/bookings', data);
            return response.data;
        },
    },

    // Admin endpoints
    admin: {
        getAll: async (params?: { search?: string; status?: string; start_date?: string; end_date?: string; page?: number }): Promise<PaginatedResponse<Booking>> => {
            const response = await api.get<PaginatedResponse<Booking>>('/admin/bookings', { params });
            return response.data;
        },

        getById: async (id: number): Promise<ApiResponse<Booking>> => {
            const response = await api.get<ApiResponse<Booking>>(`/admin/bookings/${id}`);
            return response.data;
        },

        updateStatus: async (id: number, status: BookingStatus): Promise<ApiResponse<Booking>> => {
            const response = await api.put<ApiResponse<Booking>>(`/admin/bookings/${id}/status`, { status });
            return response.data;
        },

        assignCleaner: async (id: number, cleanerId: number): Promise<ApiResponse<Booking>> => {
            const response = await api.put<ApiResponse<Booking>>(`/admin/bookings/${id}/assign-cleaner`, { cleaner_id: cleanerId });
            return response.data;
        },
    },

    // Cleaner endpoints
    cleaner: {
        getAll: async (params?: { status?: string; page?: number }): Promise<PaginatedResponse<Booking>> => {
            const response = await api.get<PaginatedResponse<Booking>>('/cleaner/bookings', { params });
            return response.data;
        },

        getById: async (id: number): Promise<ApiResponse<Booking>> => {
            const response = await api.get<ApiResponse<Booking>>(`/cleaner/bookings/${id}`);
            return response.data;
        },

        updateStatus: async (id: number, status: 'on_progress' | 'completed'): Promise<ApiResponse<Booking>> => {
            const response = await api.put<ApiResponse<Booking>>(`/cleaner/bookings/${id}/status`, { status });
            return response.data;
        },
    },
};
