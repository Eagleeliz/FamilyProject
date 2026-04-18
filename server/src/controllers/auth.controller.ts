import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../types/index.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.register({ email, password, firstName, lastName });

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Registration successful',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Login successful',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email } = req.body;
      const user = await authService.updateProfile(req.user!.userId, { firstName, lastName, email });

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        message: 'Profile updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
