"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const errors_js_1 = require("../utils/errors.js");
const requireAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new errors_js_1.ForbiddenError('Authentication required'));
    }
    if (req.user.role !== 'admin') {
        return next(new errors_js_1.ForbiddenError('Admin access required'));
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.middleware.js.map