import { Family, Person } from '../types/index.js';
interface CreateFamilyInput {
    name: string;
    description?: string;
    rootPersonName?: string;
}
interface FamilyWithDetails extends Family {
    rootPerson?: Person;
    memberCount?: number;
}
export declare class FamilyService {
    create(familyData: CreateFamilyInput, userId: string): Promise<FamilyWithDetails>;
    getById(id: string, userId?: string): Promise<FamilyWithDetails>;
    getUserFamilies(userId: string): Promise<FamilyWithDetails[]>;
    update(id: string, data: {
        name?: string;
        description?: string;
    }, userId: string, userRole: string): Promise<FamilyWithDetails>;
    delete(id: string, userId: string, userRole: string): Promise<void>;
    joinRequest(familyId: string, userId: string): Promise<void>;
    approveMember(familyId: string, userId: string, approverId: string): Promise<void>;
    leave(familyId: string, userId: string): Promise<void>;
    getAll(page?: number, limit?: number, status?: string): Promise<{
        families: FamilyWithDetails[];
        total: number;
    }>;
    private mapFamily;
    private mapPerson;
}
export declare const familyService: FamilyService;
export {};
//# sourceMappingURL=family.service.d.ts.map