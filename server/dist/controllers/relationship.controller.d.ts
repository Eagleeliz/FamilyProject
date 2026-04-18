import { Request, Response, NextFunction } from 'express';
export declare class RelationshipController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRelatives(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCousins(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const relationshipController: RelationshipController;
//# sourceMappingURL=relationship.controller.d.ts.map