import api from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterAdminRequest, User, ApiResponse } from '../types';

export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/register', data);
        return response.data;
    },

    registerAdmin: async (data: RegisterAdminRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/register/admin', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/login', data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/logout');
    },

    me: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await api.get<ApiResponse<{ user: User }>>('/me');
        return response.data;
    },
};
