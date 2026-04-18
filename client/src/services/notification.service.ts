import api from './api';
import type { ApiResponse, Notification } from '@/types';

export const notificationService = {
  async getAll() {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.patch<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch<ApiResponse>('/notifications/read-all');
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete<ApiResponse>(`/notifications/${id}`);
    return response.data;
  },
};