"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../utils/errors.js");
class AuthService {
    async register(input) {
        const existing = await (0, database_js_1.query)('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
        if (existing.rows.length > 0) {
            throw new errors_js_1.BadRequestError('Email already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const result = await (0, database_js_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name, role, status, created_at, updated_at`, [input.email.toLowerCase(), passwordHash, input.firstName, input.lastName]);
        const user = result.rows[0];
        const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });
        return {
            user: this.mapUser(user),
            tokens,
        };
    }
    async login(input) {
        const result = await (0, database_js_1.query)('SELECT * FROM users WHERE email = $1 AND status = $2', [input.email.toLowerCase(), 'active']);
        if (result.rows.length === 0) {
            throw new errors_js_1.UnauthorizedError('Invalid credentials');
        }
        const user = result.rows[0];
        const isValidPassword = await bcryptjs_1.default.compare(input.password, user.password_hash);
        if (!isValidPassword) {
            throw new errors_js_1.UnauthorizedError('Invalid credentials');
        }
        const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });
        return {
            user: this.mapUser(user),
            tokens,
        };
    }
    async getMe(userId) {
        const result = await (0, database_js_1.query)('SELECT id, email, first_name, last_name, role, status, created_at, updated_at FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        return this.mapUser(result.rows[0]);
    }
    async updateProfile(userId, data) {
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (data.firstName) {
            updates.push(`first_name = $${paramIndex++}`);
            values.push(data.firstName);
        }
        if (data.lastName) {
            updates.push(`last_name = $${paramIndex++}`);
            values.push(data.lastName);
        }
        if (data.email) {
            const existing = await (0, database_js_1.query)('SELECT id FROM users WHERE email = $1 AND id != $2', [data.email.toLowerCase(), userId]);
            if (existing.rows.length > 0) {
                throw new errors_js_1.BadRequestError('Email already in use');
            }
            updates.push(`email = $${paramIndex++}`);
            values.push(data.email.toLowerCase());
        }
        if (updates.length === 0) {
            throw new errors_js_1.BadRequestError('No fields to update');
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);
        const result = await (0, database_js_1.query)(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, email, first_name, last_name, role, status, created_at, updated_at`, values);
        return this.mapUser(result.rows[0]);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const result = await (0, database_js_1.query)('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isValid) {
            throw new errors_js_1.BadRequestError('Current password is incorrect');
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await (0, database_js_1.query)('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);
    }
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        return { accessToken, expiresIn: index_js_1.config.jwtExpiresIn };
    }
    mapUser(row) {
        return {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map