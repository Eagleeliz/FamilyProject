import { Request, Response, NextFunction } from 'express';
export declare class PersonController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    search(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFamilyTree(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const personController: PersonController;
//# sourceMappingURL=person.controller.d.ts.map