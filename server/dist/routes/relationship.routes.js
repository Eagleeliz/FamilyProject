"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const relationship_controller_js_1 = require("../controllers/relationship.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('personId').isUUID(),
    (0, express_validator_1.body)('relatedPersonId').isUUID(),
    (0, express_validator_1.body)('relationshipType').isIn(['parent', 'child', 'sibling', 'spouse']),
]), relationship_controller_js_1.relationshipController.create);
router.delete('/:id', auth_middleware_js_1.authenticate, relationship_controller_js_1.relationshipController.delete);
router.get('/person/:id/relatives', auth_middleware_js_1.authenticate, relationship_controller_js_1.relationshipController.getRelatives);
router.get('/person/:id/cousins', auth_middleware_js_1.authenticate, relationship_controller_js_1.relationshipController.getCousins);
exports.default = router;
//# sourceMappingURL=relationship.routes.js.map