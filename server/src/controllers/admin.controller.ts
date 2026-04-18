import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

export class AdminController {
  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getAnalytics();

      const response: ApiResponse<typeof analytics> = {
        success: true,
        data: analytics,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const { users, total } = await analyticsService.getAllUsers(page, limit, status);

      const response: PaginatedResponse<typeof users[0]> = {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      await analyticsService.updateUserStatus(req.params.id, status);

      const response: ApiResponse = {
        success: true,
        message: 'User status updated',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      await analyticsService.updateUserRole(req.params.id, role);

      const response: ApiResponse = {
        success: true,
        message: 'User role updated',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async approveFamily(req: Request, res: Response, next: NextFunction) {
    try {
      await analyticsService.approveFamily(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Family approved',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async rejectFamily(req: Request, res: Response, next: NextFunction) {
    try {
      await analyticsService.rejectFamily(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Family rejected',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async approvePerson(req: Request, res: Response, next: NextFunction) {
    try {
      await analyticsService.approvePerson(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Person approved',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async rejectPerson(req: Request, res: Response, next: NextFunction) {
    try {
      await analyticsService.rejectPerson(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Person rejected',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
