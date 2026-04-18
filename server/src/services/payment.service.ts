import { config } from '../config/index.js';
import { query } from '../config/database.js';
import { BadRequestError } from '../utils/errors.js';

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export class PaymentService {
  private async getAccessToken(): Promise<string> {
    const consumerKey = config.daraja.consumerKey;
    const consumerSecret = config.daraja.consumerSecret;
    
    if (!consumerKey || !consumerSecret) {
      throw new BadRequestError('Daraja credentials not configured');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as { access_token?: string; error_description?: string; error?: string };
      
      if (!response.ok) {
        throw new Error(`OAuth error: ${response.status} - ${JSON.stringify(data)}`);
      }
      
      if (data.access_token) {
        return data.access_token;
      }
      
      throw new Error(`Failed to get access token: ${data.error_description || 'Unknown error'}`);
    } catch (err) {
      console.error('Error getting access token:', err);
      throw err;
    }
  }

  async initiateSTKPush(phoneNumber: string, amount: number, accountReference: string): Promise<STKPushResponse> {
    if (!config.daraja.shortCode || !config.daraja.passKey) {
      throw new BadRequestError('Daraja short code or pass key not configured');
    }

    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    if (formattedPhone.length !== 12) {
      throw new BadRequestError('Invalid phone number format. Use format: 2547XXXXXXXX');
    }

    const accessToken = await this.getAccessToken();

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${config.daraja.shortCode}${config.daraja.passKey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: config.daraja.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(amount),
      PartyA: formattedPhone,
      PartyB: config.daraja.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.daraja.callbackUrl || 'https://example.com/callback',
      AccountReference: accountReference.substring(0, 20),
      TransactionDesc: 'Family Contribution',
    };

    console.log('STK Push Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json() as STKPushResponse;
      console.log('STK Push Response:', JSON.stringify(result, null, 2));
      
      return result;
    } catch (err) {
      console.error('STK Push error:', err);
      throw err;
    }
  }

  async recordPayment(familyId: string, userId: string, amount: number, phoneNumber: string, status: string, transactionId?: string) {
    const result = await query(
      `INSERT INTO payments (family_id, user_id, amount, phone_number, status, transaction_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [familyId, userId, amount, phoneNumber, status, transactionId || null]
    );
    return result.rows[0];
  }

  async getFamilyPayments(familyId: string) {
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name 
       FROM payments p
       JOIN users u ON p.user_id = u.id
       WHERE p.family_id = $1
       ORDER BY p.created_at DESC`,
      [familyId]
    );
    return result.rows;
  }
}

export const paymentService = new PaymentService();