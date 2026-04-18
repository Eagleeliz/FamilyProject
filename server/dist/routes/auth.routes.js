"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('firstName').trim().notEmpty(),
    (0, express_validator_1.body)('lastName').trim().notEmpty(),
]), auth_controller_js_1.authController.register);
router.post('/login', (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
]), auth_controller_js_1.authController.login);
router.get('/me', auth_middleware_js_1.authenticate, auth_controller_js_1.authController.getMe);
router.patch('/profile', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('firstName').optional().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().trim().notEmpty(),
]), auth_controller_js_1.authController.updateProfile);
router.post('/change-password', auth_middleware_js_1.authenticate, (0, validate_middleware_js_1.validate)([
    (0, express_validator_1.body)('currentPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }),
]), auth_controller_js_1.authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map