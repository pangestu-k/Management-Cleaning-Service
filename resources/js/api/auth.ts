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

    updateProfile: async (data: {
        name?: string;
        email?: string;
        password?: string;
        current_password?: string;
        profile_photo?: File;
    }): Promise<ApiResponse<{ user: User }>> => {
        const formData = new FormData();
        
        if (data.name) formData.append('name', data.name);
        if (data.email) formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.current_password) formData.append('current_password', data.current_password);
        if (data.profile_photo) formData.append('profile_photo', data.profile_photo);
        
        const response = await api.put<ApiResponse<{ user: User }>>('/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
