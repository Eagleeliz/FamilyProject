import api from './api';
import type { ApiResponse, PaginatedResponse, Person, TreeNode } from '@/types';

export const personService = {
  async search(query: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
    const response = await api.get<PaginatedResponse<Person>>(`/persons/search?${params}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<Person>>(`/persons/${id}`);
    return response.data;
  },

  async getFamilyTree(familyId: string) {
    const response = await api.get<ApiResponse<TreeNode[]>>(`/persons/${familyId}/tree`);
    return response.data;
  },

  async create(data: {
    firstName: string;
    lastName: string;
    familyId: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    profileImageUrl?: string;
  }) {
    const response = await api.post<ApiResponse<Person>>('/persons', data);
    return response.data;
  },

  async update(id: string, data: Partial<Person>) {
    const response = await api.patch<ApiResponse<Person>>(`/persons/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/persons/${id}`);
    return response.data;
  },
};
