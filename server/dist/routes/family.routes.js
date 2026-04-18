"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const family_controller_js_1 = require("../controllers/family.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.getUserFamilies);
router.get('/all', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.getAll);
router.post('/', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('rootPersonName').optional().trim(),
]), family_controller_js_1.familyController.create);
router.get('/:id', auth_middleware_js_1.optionalAuth, family_controller_js_1.familyController.getById);
router.patch('/:id', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('description').optional().trim(),
]), family_controller_js_1.familyController.update);
router.delete('/:id', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.delete);
router.post('/:id/join', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.joinRequest);
router.patch('/:id/approve', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.approveMember);
router.patch('/:id/leave', auth_middleware_js_1.authenticate, family_controller_js_1.familyController.leave);
exports.default = router;
//# sourceMappingURL=family.routes.js.map