"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const database_js_1 = require("../config/database.js");
class AnalyticsService {
    async getAnalytics() {
        const [usersCount, familiesCount, personsCount, recentSignups, recentFamilies] = await Promise.all([
            (0, database_js_1.query)(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked
        FROM users
      `),
            (0, database_js_1.query)(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM families
      `),
            (0, database_js_1.query)(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM persons
      `),
            (0, database_js_1.query)(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
            (0, database_js_1.query)(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM families
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
        ]);
        return {
            totalUsers: parseInt(usersCount.rows[0].total),
            activeUsers: parseInt(usersCount.rows[0].active),
            blockedUsers: parseInt(usersCount.rows[0].blocked),
            totalFamilies: parseInt(familiesCount.rows[0].total),
            approvedFamilies: parseInt(familiesCount.rows[0].approved),
            pendingFamilies: parseInt(familiesCount.rows[0].pending),
            totalPersons: parseInt(personsCount.rows[0].total),
            approvedPersons: parseInt(personsCount.rows[0].approved),
            pendingPersons: parseInt(personsCount.rows[0].pending),
            recentSignups: recentSignups.rows.map((r) => ({
                date: r.date.toISOString().split('T')[0],
                count: parseInt(r.count),
            })),
            recentFamilies: recentFamilies.rows.map((r) => ({
                date: r.date.toISOString().split('T')[0],
                count: parseInt(r.count),
            })),
        };
    }
    async getAllUsers(page = 1, limit = 20, status) {
        const offset = (page - 1) * limit;
        let whereClause = '';
        const values = [];
        let paramIndex = 1;
        if (status) {
            whereClause = `WHERE status = $${paramIndex++}`;
            values.push(status);
        }
        const countResult = await (0, database_js_1.query)(`SELECT COUNT(*) as total FROM users ${whereClause}`, values);
        const total = parseInt(countResult.rows[0].total);
        values.push(limit, offset);
        const result = await (0, database_js_1.query)(`SELECT id, email, first_name, last_name, role, status, created_at, updated_at 
       FROM users ${whereClause}
       ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, values);
        return {
            users: result.rows.map((row) => ({
                id: row.id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                role: row.role,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
            })),
            total,
        };
    }
    async updateUserStatus(userId, status) {
        await (0, database_js_1.query)('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, userId]);
    }
    async updateUserRole(userId, role) {
        await (0, database_js_1.query)('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);
    }
    async approveFamily(familyId) {
        await (0, database_js_1.query)("UPDATE families SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [familyId]);
    }
    async rejectFamily(familyId) {
        await (0, database_js_1.query)("UPDATE families SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [familyId]);
    }
    async approvePerson(personId) {
        await (0, database_js_1.query)("UPDATE persons SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [personId]);
    }
    async rejectPerson(personId) {
        await (0, database_js_1.query)("UPDATE persons SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [personId]);
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analytics.service.js.map