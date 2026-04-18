import { Request, Response, NextFunction } from 'express';
import { relationshipService } from '../services/relationship.service.js';
import { ApiResponse } from '../types/index.js';

export class RelationshipController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { personId, relatedPersonId, relationshipType } = req.body;
      const relationships = await relationshipService.create(
        { personId, relatedPersonId, relationshipType },
        req.user!.userId
      );

      const response: ApiResponse<typeof relationships> = {
        success: true,
        data: relationships,
        message: 'Relationship created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await relationshipService.delete(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Relationship deleted successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getRelatives(req: Request, res: Response, next: NextFunction) {
    try {
      const relatives = await relationshipService.getRelatives(req.params.id, req.user!.userId);

      const response: ApiResponse<typeof relatives> = {
        success: true,
        data: relatives,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCousins(req: Request, res: Response, next: NextFunction) {
    try {
      const maxDegree = parseInt(req.query.degree as string) || 3;
      const cousins = await relationshipService.getCousins(req.params.id, req.user!.userId, maxDegree);

      const response: ApiResponse<typeof cousins> = {
        success: true,
        data: cousins,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const relationshipController = new RelationshipController();
