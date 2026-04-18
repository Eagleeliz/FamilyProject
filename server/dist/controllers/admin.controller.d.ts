import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveFamily(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectFamily(req: Request, res: Response, next: NextFunction): Promise<void>;
    approvePerson(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectPerson(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=admin.controller.d.ts.map