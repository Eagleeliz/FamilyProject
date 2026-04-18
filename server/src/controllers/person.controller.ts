import { Request, Response, NextFunction } from 'express';
import { personService } from '../services/person.service.js';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

export class PersonController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl, familyId } = req.body;
      const person = await personService.create(
        { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl, familyId },
        req.user!.userId
      );

      const response: ApiResponse<typeof person> = {
        success: true,
        data: person,
        message: 'Person created successfully',
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const person = await personService.getById(req.params.id);

      const response: ApiResponse<typeof person> = {
        success: true,
        data: person,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl } = req.body;
      const person = await personService.update(
        req.params.id,
        { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl },
        req.user!.userId
      );

      const response: ApiResponse<typeof person> = {
        success: true,
        data: person,
        message: 'Person updated successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await personService.delete(req.params.id, req.user!.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Person deleted successfully',
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { persons, pagination } = await personService.search(query, page, limit);

      const response: PaginatedResponse<typeof persons[0]> = {
        success: true,
        data: persons,
        pagination,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFamilyTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await personService.getFamilyTree(req.params.id, req.user?.userId);

      const response: ApiResponse<typeof tree> = {
        success: true,
        data: tree,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const personController = new PersonController();
