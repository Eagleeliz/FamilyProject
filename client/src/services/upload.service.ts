import api from './api';
import type { ApiResponse } from '@/types';

export const uploadService = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
