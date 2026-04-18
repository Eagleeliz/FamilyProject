import api from './api';
import type { ApiResponse, AuthResponse } from '@/types';

export const authService = {
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get<ApiResponse<AuthResponse['user']>>('/auth/me');
    return response.data;
  },

  async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
    const response = await api.patch<ApiResponse<AuthResponse['user']>>('/auth/profile', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  },
};
