interface Analytics {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    totalFamilies: number;
    approvedFamilies: number;
    pendingFamilies: number;
    totalPersons: number;
    approvedPersons: number;
    pendingPersons: number;
    recentSignups: {
        date: string;
        count: number;
    }[];
    recentFamilies: {
        date: string;
        count: number;
    }[];
}
export declare class AnalyticsService {
    getAnalytics(): Promise<Analytics>;
    getAllUsers(page?: number, limit?: number, status?: string): Promise<{
        users: Record<string, unknown>[];
        total: number;
    }>;
    updateUserStatus(userId: string, status: 'active' | 'blocked'): Promise<void>;
    updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void>;
    approveFamily(familyId: string): Promise<void>;
    rejectFamily(familyId: string): Promise<void>;
    approvePerson(personId: string): Promise<void>;
    rejectPerson(personId: string): Promise<void>;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analytics.service.d.ts.map