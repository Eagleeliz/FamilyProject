import api from './api';
import type { ApiResponse } from '@/types';

export const paymentService = {
  async initiateSTKPush(data: { phoneNumber: string; amount: number; familyId: string; accountReference?: string }) {
    const response = await api.post<ApiResponse<{
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResponseCode: string;
      ResponseDescription: string;
      CustomerMessage: string;
    }>>('/payments/stkpush', data);
    return response.data;
  },

  async getFamilyPayments(familyId: string) {
    const response = await api.get<ApiResponse<{
      id: string;
      family_id: string;
      user_id: string;
      amount: number;
      phone_number: string;
      status: string;
      transaction_id: string;
      created_at: string;
      first_name: string;
      last_name: string;
    }[]>>(`/payments/family/${familyId}`);
    return response.data;
  },
};