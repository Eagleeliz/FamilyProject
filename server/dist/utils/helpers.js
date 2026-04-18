"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeSearchQuery = exports.generatePagination = exports.isValidUUID = exports.formatDate = void 0;
const formatDate = (date) => {
    if (!date)
        return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};
exports.formatDate = formatDate;
const isValidUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};
exports.isValidUUID = isValidUUID;
const generatePagination = (page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
    };
};
exports.generatePagination = generatePagination;
const sanitizeSearchQuery = (query) => {
    return query.replace(/[<>]/g, '').trim();
};
exports.sanitizeSearchQuery = sanitizeSearchQuery;
//# sourceMappingURL=helpers.js.map