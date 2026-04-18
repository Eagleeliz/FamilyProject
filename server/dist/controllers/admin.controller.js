"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const analytics_service_js_1 = require("../services/analytics.service.js");
class AdminController {
    async getAnalytics(req, res, next) {
        try {
            const analytics = await analytics_service_js_1.analyticsService.getAnalytics();
            const response = {
                success: true,
                data: analytics,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const { users, total } = await analytics_service_js_1.analyticsService.getAllUsers(page, limit, status);
            const response = {
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserStatus(req, res, next) {
        try {
            const { status } = req.body;
            await analytics_service_js_1.analyticsService.updateUserStatus(req.params.id, status);
            const response = {
                success: true,
                message: 'User status updated',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserRole(req, res, next) {
        try {
            const { role } = req.body;
            await analytics_service_js_1.analyticsService.updateUserRole(req.params.id, role);
            const response = {
                success: true,
                message: 'User role updated',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async approveFamily(req, res, next) {
        try {
            await analytics_service_js_1.analyticsService.approveFamily(req.params.id);
            const response = {
                success: true,
                message: 'Family approved',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async rejectFamily(req, res, next) {
        try {
            await analytics_service_js_1.analyticsService.rejectFamily(req.params.id);
            const response = {
                success: true,
                message: 'Family rejected',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async approvePerson(req, res, next) {
        try {
            await analytics_service_js_1.analyticsService.approvePerson(req.params.id);
            const response = {
                success: true,
                message: 'Person approved',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async rejectPerson(req, res, next) {
        try {
            await analytics_service_js_1.analyticsService.rejectPerson(req.params.id);
            const response = {
                success: true,
                message: 'Person rejected',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=admin.controller.js.map