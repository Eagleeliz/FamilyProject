import api from './api';
import type { ApiResponse, PaginatedResponse, Analytics, User, Family } from '@/types';

export const adminService = {
  async getAnalytics() {
    const response = await api.get<ApiResponse<Analytics>>('/admin/analytics');
    return response.data;
  },

  async getAllPaginated(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get<PaginatedResponse<Family>>(`/families/all?${params}`);
    return response.data;
  },

  async getUsers(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get<PaginatedResponse<User>>(`/admin/users?${params}`);
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'active' | 'blocked') {
    const response = await api.patch<ApiResponse>(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const response = await api.patch<ApiResponse>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async approveFamily(familyId: string) {
    const response = await api.patch<ApiResponse>(`/admin/families/${familyId}/approve`);
    return response.data;
  },

  async rejectFamily(familyId: string) {
    const response = await api.patch<ApiResponse>(`/admin/families/${familyId}/reject`);
    return response.data;
  },

  async approvePerson(personId: string) {
    const response = await api.patch<ApiResponse>(`/admin/persons/${personId}/approve`);
    return response.data;
  },

  async rejectPerson(personId: string) {
    const response = await api.patch<ApiResponse>(`/admin/persons/${personId}/reject`);
    return response.data;
  },
};
