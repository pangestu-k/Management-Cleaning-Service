import api from './axios';
import type { DashboardResponse, ApiResponse } from '../types';

export const dashboardApi = {
    getStatistics: async (): Promise<ApiResponse<DashboardResponse>> => {
        const response = await api.get<ApiResponse<DashboardResponse>>('/admin/dashboard');
        return response.data;
    },
};
