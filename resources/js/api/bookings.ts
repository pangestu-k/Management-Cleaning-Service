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

        submitComplaint: async (id: number, complaintImage: File, description: string): Promise<ApiResponse<Booking>> => {
            const formData = new FormData();
            formData.append('customer_complaint', complaintImage);
            formData.append('customer_complaint_desc', description);
            
            const response = await api.post<ApiResponse<Booking>>(`/customer/bookings/${id}/complaint`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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

        updateStatus: async (id: number, status: 'on_progress' | 'completed', evidenceFile?: File): Promise<ApiResponse<Booking>> => {
            const formData = new FormData();
            formData.append('status', status);
            
            if (evidenceFile) {
                formData.append('evidence_cleaner', evidenceFile);
            }
            
            const response = await api.put<ApiResponse<Booking>>(`/cleaner/bookings/${id}/status`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },

        uploadEvidence: async (id: number, evidence: string): Promise<ApiResponse<Booking>> => {
            const response = await api.post<ApiResponse<Booking>>(`/cleaner/bookings/${id}/evidence`, { evidence_cleaner: evidence });
            return response.data;
        },

        getSchedule: async (params?: { month?: number; year?: number; date?: string }): Promise<ApiResponse<{
            dates_with_bookings: string[];
            bookings_by_date: Record<string, Array<{
                id: number;
                booking_code: string;
                customer_name: string;
                service_name: string;
                start_time: string;
                end_time: string;
                address: string;
                status: string;
                total_price: number;
            }>>;
        }>> => {
            const response = await api.get<ApiResponse<{
                dates_with_bookings: string[];
                bookings_by_date: Record<string, Array<{
                    id: number;
                    booking_code: string;
                    customer_name: string;
                    service_name: string;
                    start_time: string;
                    end_time: string;
                    address: string;
                    status: string;
                    total_price: number;
                }>>;
            }>>('/cleaner/schedule', { params });
            return response.data;
        },
    },
};
