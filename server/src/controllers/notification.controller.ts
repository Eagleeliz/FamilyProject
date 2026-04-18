import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { ApiResponse } from '../types/index.js';

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getByUserId(req.user!.userId);

      const response: ApiResponse<typeof notifications> = {
        success: true,
        data: notifications,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);

      const response: ApiResponse<number> = {
        success: true,
        data: count,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Notification marked as read',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'All notifications marked as read',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Notification deleted',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();