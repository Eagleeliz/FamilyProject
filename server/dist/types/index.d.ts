export interface User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    status: 'active' | 'blocked';
    createdAt: Date;
    updatedAt: Date;
}
export interface Family {
    id: string;
    name: string;
    description: string | null;
    rootPersonId: string | null;
    status: 'pending' | 'approved' | 'rejected';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Person {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    dateOfDeath: Date | null;
    profileImageUrl: string | null;
    familyId: string | null;
    createdBy: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}
export interface Relationship {
    id: string;
    personId: string;
    relatedPersonId: string;
    relationshipType: 'parent' | 'child' | 'sibling' | 'spouse';
    createdBy: string;
    createdAt: Date;
}
export interface FamilyMember {
    id: string;
    userId: string;
    familyId: string;
    role: 'admin' | 'member';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface TreeNode {
    person: Person;
    children: TreeNode[];
    parents: TreeNode[];
    siblings: Person[];
    spouse: Person | null;
    level: number;
}
export interface CousinResult {
    degree: number;
    cousins: Person[];
}
//# sourceMappingURL=index.d.ts.map