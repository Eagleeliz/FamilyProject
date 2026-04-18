"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipController = exports.RelationshipController = void 0;
const relationship_service_js_1 = require("../services/relationship.service.js");
class RelationshipController {
    async create(req, res, next) {
        try {
            const { personId, relatedPersonId, relationshipType } = req.body;
            const relationships = await relationship_service_js_1.relationshipService.create({ personId, relatedPersonId, relationshipType }, req.user.userId);
            const response = {
                success: true,
                data: relationships,
                message: 'Relationship created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await relationship_service_js_1.relationshipService.delete(req.params.id, req.user.userId);
            const response = {
                success: true,
                message: 'Relationship deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getRelatives(req, res, next) {
        try {
            const relatives = await relationship_service_js_1.relationshipService.getRelatives(req.params.id, req.user.userId);
            const response = {
                success: true,
                data: relatives,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getCousins(req, res, next) {
        try {
            const maxDegree = parseInt(req.query.degree) || 3;
            const cousins = await relationship_service_js_1.relationshipService.getCousins(req.params.id, req.user.userId, maxDegree);
            const response = {
                success: true,
                data: cousins,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RelationshipController = RelationshipController;
exports.relationshipController = new RelationshipController();
//# sourceMappingURL=relationship.controller.js.map