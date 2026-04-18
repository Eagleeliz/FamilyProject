import api from './api';
import type { ApiResponse, Relationship, Relatives, CousinResult } from '@/types';

export const relationshipService = {
  async create(data: {
    personId: string;
    relatedPersonId: string;
    relationshipType: 'parent' | 'child' | 'sibling' | 'spouse';
  }) {
    const response = await api.post<ApiResponse<Relationship[]>>('/relationships', data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/relationships/${id}`);
    return response.data;
  },

  async getRelatives(personId: string) {
    const response = await api.get<ApiResponse<Relatives>>(`/relationships/person/${personId}/relatives`);
    return response.data;
  },

  async getCousins(personId: string, degree = 3) {
    const response = await api.get<ApiResponse<CousinResult[]>>(
      `/relationships/person/${personId}/cousins?degree=${degree}`
    );
    return response.data;
  },
};
