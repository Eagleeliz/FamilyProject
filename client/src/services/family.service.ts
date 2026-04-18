import api from './api';
import type { ApiResponse, PaginatedResponse, Family } from '@/types';

export const familyService = {
  async getAll() {
    const response = await api.get<ApiResponse<Family[]>>('/families');
    return response.data;
  },

  async getPublic() {
    const response = await api.get<ApiResponse<Family[]>>('/families/public');
    return response.data;
  },

  async getAllPaginated(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    const response = await api.get<PaginatedResponse<Family>>(`/families/all?${params}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Family>>(`/families/${id}`);
    return response.data;
  },

  async create(data: { name: string; description?: string; rootPersonName?: string }) {
    const response = await api.post<ApiResponse<Family>>('/families', data);
    return response.data;
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const response = await api.patch<ApiResponse<Family>>(`/families/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/families/${id}`);
    return response.data;
  },

  async joinRequest(id: string) {
    const response = await api.post<ApiResponse>(`/families/${id}/join`);
    return response.data;
  },

  async leave(id: string) {
    const response = await api.patch<ApiResponse>(`/families/${id}/leave`);
    return response.data;
  },

  async getPendingMembers(id: string) {
    const response = await api.get<ApiResponse<{ id: string; userId: string; firstName: string; lastName: string; email: string }[]>>(`/families/${id}/pending-members`);
    return response.data;
  },

  async approveMember(familyId: string, userId: string) {
    const response = await api.patch<ApiResponse>(`/families/${familyId}/approve-member`, { userId });
    return response.data;
  },

  async rejectMember(familyId: string, userId: string) {
    const response = await api.patch<ApiResponse>(`/families/${familyId}/reject-member`, { userId });
    return response.data;
  },
};
