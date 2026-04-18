"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const result = await auth_service_js_1.authService.register({ email, password, firstName, lastName });
            const response = {
                success: true,
                data: result,
                message: 'Registration successful',
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_js_1.authService.login({ email, password });
            const response = {
                success: true,
                data: result,
                message: 'Login successful',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const user = await auth_service_js_1.authService.getMe(req.user.userId);
            const response = {
                success: true,
                data: user,
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const { firstName, lastName, email } = req.body;
            const user = await auth_service_js_1.authService.updateProfile(req.user.userId, { firstName, lastName, email });
            const response = {
                success: true,
                data: user,
                message: 'Profile updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            await auth_service_js_1.authService.changePassword(req.user.userId, currentPassword, newPassword);
            const response = {
                success: true,
                message: 'Password changed successfully',
            };
            res.json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map