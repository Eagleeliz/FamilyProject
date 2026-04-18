import { Person, TreeNode } from '../types/index.js';
import { generatePagination } from '../utils/helpers.js';
interface CreatePersonInput {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    profileImageUrl?: string;
    familyId: string;
}
interface UpdatePersonInput {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    profileImageUrl?: string;
}
export declare class PersonService {
    create(input: CreatePersonInput, userId: string): Promise<Person>;
    getById(id: string): Promise<Person>;
    update(id: string, data: UpdatePersonInput, userId: string): Promise<Person>;
    delete(id: string, userId: string): Promise<void>;
    search(queryStr: string, page?: number, limit?: number): Promise<{
        persons: (Person & {
            familyName?: string;
        })[];
        pagination: ReturnType<typeof generatePagination>;
    }>;
    getFamilyTree(familyId: string, userId?: string): Promise<TreeNode[]>;
    private buildTree;
    getPending(page?: number, limit?: number): Promise<{
        persons: Person[];
        total: number;
    }>;
    private mapPerson;
}
export declare const personService: PersonService;
export {};
//# sourceMappingURL=person.service.d.ts.map