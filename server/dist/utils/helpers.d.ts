export declare const formatDate: (date: Date | string | null) => string | null;
export declare const isValidUUID: (str: string) => boolean;
export declare const generatePagination: (page: number, limit: number, total: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
export declare const sanitizeSearchQuery: (query: string) => string;
//# sourceMappingURL=helpers.d.ts.map