"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyController = exports.FamilyController = void 0;
const family_service_js_1 = require("../services/family.service.js");
class FamilyController {
    async create(req, res, next) {
        try {
            const { name, description, rootPersonName } = req.body;
            const family = await family_service_js_1.familyService.create({ name, description, rootPersonName }, req.user.userId);
            const response = {
                success: true,
                data: family,
                message: 'Family created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const family = await family_service_js_1.familyService.getById(req.params.id, req.user?.userId);
            const response = {
                success: true,
                data: family,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserFamilies(req, res, next) {
        try {
            const families = await family_service_js_1.familyService.getUserFamilies(req.user.userId);
            const response = {
                success: true,
                data: families,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { name, description } = req.body;
            const family = await family_service_js_1.familyService.update(req.params.id, { name, description }, req.user.userId, req.user.role);
            const response = {
                success: true,
                data: family,
                message: 'Family updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await family_service_js_1.familyService.delete(req.params.id, req.user.userId, req.user.role);
            const response = {
                success: true,
                message: 'Family deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async joinRequest(req, res, next) {
        try {
            await family_service_js_1.familyService.joinRequest(req.params.id, req.user.userId);
            const response = {
                success: true,
                message: 'Join request submitted',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async approveMember(req, res, next) {
        try {
            const { userId } = req.body;
            await family_service_js_1.familyService.approveMember(req.params.id, userId, req.user.userId);
            const response = {
                success: true,
                message: 'Member approved',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async leave(req, res, next) {
        try {
            await family_service_js_1.familyService.leave(req.params.id, req.user.userId);
            const response = {
                success: true,
                message: 'Left family successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const { families, total } = await family_service_js_1.familyService.getAll(page, limit, status);
            const response = {
                success: true,
                data: families,
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
}
exports.FamilyController = FamilyController;
exports.familyController = new FamilyController();
//# sourceMappingURL=family.controller.js.map