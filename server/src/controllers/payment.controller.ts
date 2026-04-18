import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { ApiResponse } from '../types/index.js';

export class PaymentController {
  async initiateSTKPush(req: Request, res: Response, next: NextFunction) {
 
    try {
      const { phoneNumber, amount, familyId, accountReference } = req.body;
      
      if (!phoneNumber || !amount || !familyId) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, amount, and family ID are required',
        });
      }

      const result = await paymentService.initiateSTKPush(phoneNumber, amount, accountReference || familyId);
       console.log(result)
      if (result.ResponseCode === '0') {
        await paymentService.recordPayment(
          familyId,
          req.user!.userId,
          amount,
          phoneNumber,
          'pending',
          result.CheckoutRequestID
        );

        return res.json({
          success: true,
          data: result,
          message: 'STK push sent successfully',
        });
      } else {
        return res.json({
          success: false,
          data: result,
          message: result.ResponseDescription || result.CustomerMessage || 'Payment failed',
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      next(error);
    }
  }

  async getFamilyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getFamilyPayments(req.params.familyId);

      const response: ApiResponse<typeof payments> = {
        success: true,
        data: payments,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();