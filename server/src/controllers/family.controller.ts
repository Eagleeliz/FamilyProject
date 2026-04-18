import { Request, Response, NextFunction } from 'express';
import { familyService } from '../services/family.service.js';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

export class FamilyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, rootPersonName } = req.body;
      const family = await familyService.create({ name, description, rootPersonName }, req.user!.userId);

      const response: ApiResponse<typeof family> = {
        success: true,
        data: family,
        message: 'Family created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const family = await familyService.getById(req.params.id, req.user?.userId);

      const response: ApiResponse<typeof family> = {
        success: true,
        data: family,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserFamilies(req: Request, res: Response, next: NextFunction) {
    try {
      const families = await familyService.getUserFamilies(req.user!.userId);

      const response: ApiResponse<typeof families> = {
        success: true,
        data: families,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const family = await familyService.update(req.params.id, { name, description }, req.user!.userId, req.user!.role);

      const response: ApiResponse<typeof family> = {
        success: true,
        data: family,
        message: 'Family updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await familyService.delete(req.params.id, req.user!.userId, req.user!.role);

      const response: ApiResponse = {
        success: true,
        message: 'Family deleted successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async joinRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await familyService.joinRequest(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Join request submitted',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async approveMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      await familyService.approveMember(req.params.id, userId, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Member approved',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      await familyService.leave(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Left family successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const { families, total } = await familyService.getAll(page, limit, status);

      const response: PaginatedResponse<typeof families[0]> = {
        success: true,
        data: families,
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

  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const families = await familyService.getPublicFamilies();

      const response: ApiResponse<typeof families> = {
        success: true,
        data: families,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPendingMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await familyService.getPendingMembers(req.params.id, req.user!.userId);

      const response: ApiResponse<typeof members> = {
        success: true,
        data: members,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async rejectMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      await familyService.rejectMember(req.params.id, userId, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Member rejected',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const familyController = new FamilyController();
