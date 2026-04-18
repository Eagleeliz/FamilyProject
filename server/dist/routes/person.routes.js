"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const person_controller_js_1 = require("../controllers/person.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const router = (0, express_1.Router)();
router.get('/search', auth_middleware_js_1.optionalAuth, person_controller_js_1.personController.search);
router.post('/', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
    (0, express_validator_1.body)('familyId').isUUID(),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601(),
    (0, express_validator_1.body)('dateOfDeath').optional().isISO8601(),
    (0, express_validator_1.body)('profileImageUrl').optional().isURL(),
]), person_controller_js_1.personController.create);
router.get('/:id', auth_middleware_js_1.optionalAuth, person_controller_js_1.personController.getById);
router.get('/:id/tree', auth_middleware_js_1.optionalAuth, person_controller_js_1.personController.getFamilyTree);
router.patch('/:id', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('dateOfBirth').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('dateOfDeath').optional({ nullable: true }).isISO8601(),
    (0, express_validator_1.body)('profileImageUrl').optional({ nullable: true }).isURL(),
]), person_controller_js_1.personController.update);
router.delete('/:id', auth_middleware_js_1.authenticate, person_controller_js_1.personController.delete);
exports.default = router;
//# sourceMappingURL=person.routes.js.map