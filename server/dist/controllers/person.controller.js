"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personController = exports.PersonController = void 0;
const person_service_js_1 = require("../services/person.service.js");
class PersonController {
    async create(req, res, next) {
        try {
            const { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl, familyId } = req.body;
            const person = await person_service_js_1.personService.create({ firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl, familyId }, req.user.userId);
            const response = {
                success: true,
                data: person,
                message: 'Person created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const person = await person_service_js_1.personService.getById(req.params.id);
            const response = {
                success: true,
                data: person,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl } = req.body;
            const person = await person_service_js_1.personService.update(req.params.id, { firstName, lastName, dateOfBirth, dateOfDeath, profileImageUrl }, req.user.userId);
            const response = {
                success: true,
                data: person,
                message: 'Person updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await person_service_js_1.personService.delete(req.params.id, req.user.userId);
            const response = {
                success: true,
                message: 'Person deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const query = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { persons, pagination } = await person_service_js_1.personService.search(query, page, limit);
            const response = {
                success: true,
                data: persons,
                pagination,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getFamilyTree(req, res, next) {
        try {
            const tree = await person_service_js_1.personService.getFamilyTree(req.params.id, req.user?.userId);
            const response = {
                success: true,
                data: tree,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PersonController = PersonController;
exports.personController = new PersonController();
//# sourceMappingURL=person.controller.js.map