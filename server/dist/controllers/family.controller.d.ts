import { Request, Response, NextFunction } from 'express';
export declare class FamilyController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserFamilies(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    joinRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveMember(req: Request, res: Response, next: NextFunction): Promise<void>;
    leave(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const familyController: FamilyController;
//# sourceMappingURL=family.controller.d.ts.map