"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familyService = exports.FamilyService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
class FamilyService {
    async create(familyData, userId) {
        const client = await (await import('../config/database.js')).pool.connect();
        try {
            await client.query('BEGIN');
            const familyResult = await client.query(`INSERT INTO families (name, description, status, created_by) 
         VALUES ($1, $2, 'approved', $3) 
         RETURNING *`, [familyData.name, familyData.description || null, userId]);
            const family = familyResult.rows[0];
            let rootPerson = null;
            if (familyData.rootPersonName) {
                const nameParts = familyData.rootPersonName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || familyData.name;
                const personResult = await client.query(`INSERT INTO persons (first_name, last_name, family_id, created_by, status) 
           VALUES ($1, $2, $3, $4, 'approved') 
           RETURNING *`, [firstName, lastName, family.id, userId]);
                rootPerson = this.mapPerson(personResult.rows[0]);
                await client.query('UPDATE families SET root_person_id = $1 WHERE id = $2', [rootPerson.id, family.id]);
            }
            await client.query(`INSERT INTO family_members (user_id, family_id, role, status) 
         VALUES ($1, $2, 'admin', 'approved')`, [userId, family.id]);
            await client.query('COMMIT');
            return {
                ...this.mapFamily(family),
                rootPerson: rootPerson || undefined,
                memberCount: 1,
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getById(id, userId) {
        const result = await (0, database_js_1.query)('SELECT * FROM families WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Family not found');
        }
        const family = this.mapFamily(result.rows[0]);
        let rootPerson;
        if (family.rootPersonId) {
            const personResult = await (0, database_js_1.query)('SELECT * FROM persons WHERE id = $1', [family.rootPersonId]);
            if (personResult.rows.length > 0) {
                rootPerson = this.mapPerson(personResult.rows[0]);
            }
        }
        const memberCountResult = await (0, database_js_1.query)('SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND status = $2', [id, 'approved']);
        return {
            ...family,
            rootPerson,
            memberCount: parseInt(memberCountResult.rows[0].count),
        };
    }
    async getUserFamilies(userId) {
        const result = await (0, database_js_1.query)(`SELECT f.*, fm.role as member_role 
       FROM families f
       JOIN family_members fm ON f.id = fm.family_id
       WHERE fm.user_id = $1 AND fm.status = 'approved' AND f.status = 'approved'
       ORDER BY f.created_at DESC`, [userId]);
        const families = [];
        for (const row of result.rows) {
            const family = this.mapFamily(row);
            let rootPerson;
            if (family.rootPersonId) {
                const personResult = await (0, database_js_1.query)('SELECT * FROM persons WHERE id = $1', [family.rootPersonId]);
                if (personResult.rows.length > 0) {
                    rootPerson = this.mapPerson(personResult.rows[0]);
                }
            }
            const memberCountResult = await (0, database_js_1.query)('SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND status = $2', [family.id, 'approved']);
            families.push({
                ...family,
                rootPerson,
                memberCount: parseInt(memberCountResult.rows[0].count),
            });
        }
        return families;
    }
    async update(id, data, userId, userRole) {
        const membership = await (0, database_js_1.query)('SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [id, userId, 'approved']);
        if (membership.rows.length === 0 && userRole !== 'admin') {
            throw new errors_js_1.ForbiddenError('Not a member of this family');
        }
        if (membership.rows[0]?.role !== 'admin' && userRole !== 'admin') {
            throw new errors_js_1.ForbiddenError('Admin access required');
        }
        const updates = [];
        const values = [];
        let paramIndex = 1;
        if (data.name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (updates.length === 0) {
            throw new errors_js_1.BadRequestError('No fields to update');
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const result = await (0, database_js_1.query)(`UPDATE families SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
        return this.getById(result.rows[0].id);
    }
    async delete(id, userId, userRole) {
        const membership = await (0, database_js_1.query)('SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [id, userId, 'approved']);
        if (userRole !== 'admin' && membership.rows[0]?.role !== 'admin') {
            throw new errors_js_1.ForbiddenError('Admin access required');
        }
        await (0, database_js_1.query)('DELETE FROM families WHERE id = $1', [id]);
    }
    async joinRequest(familyId, userId) {
        const existing = await (0, database_js_1.query)('SELECT id FROM family_members WHERE user_id = $1 AND family_id = $2', [userId, familyId]);
        if (existing.rows.length > 0) {
            throw new errors_js_1.BadRequestError('Already a member or pending');
        }
        await (0, database_js_1.query)('INSERT INTO family_members (user_id, family_id, role, status) VALUES ($1, $2, $3, $4)', [userId, familyId, 'member', 'pending']);
    }
    async approveMember(familyId, userId, approverId) {
        const membership = await (0, database_js_1.query)('SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [approverId, familyId, 'approved']);
        if (membership.rows[0]?.role !== 'admin') {
            throw new errors_js_1.ForbiddenError('Admin access required');
        }
        const result = await (0, database_js_1.query)(`UPDATE family_members SET status = 'approved' WHERE user_id = $1 AND family_id = $2 AND status = $3 RETURNING id`, [userId, familyId, 'pending']);
        if (result.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Pending membership not found');
        }
    }
    async leave(familyId, userId) {
        const membership = await (0, database_js_1.query)('SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [userId, familyId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Membership not found');
        }
        if (membership.rows[0].role === 'admin') {
            const adminCount = await (0, database_js_1.query)(`SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND role = 'admin' AND status = $2`, [familyId, 'approved']);
            if (parseInt(adminCount.rows[0].count) <= 1) {
                throw new errors_js_1.BadRequestError('Cannot leave: you are the only admin');
            }
        }
        await (0, database_js_1.query)('DELETE FROM family_members WHERE user_id = $1 AND family_id = $2', [userId, familyId]);
    }
    async getAll(page = 1, limit = 20, status) {
        const offset = (page - 1) * limit;
        let whereClause = '';
        const values = [];
        let paramIndex = 1;
        if (status) {
            whereClause = `WHERE f.status = $${paramIndex++}`;
            values.push(status);
        }
        const countResult = await (0, database_js_1.query)(`SELECT COUNT(*) as total FROM families f ${whereClause}`, values);
        const total = parseInt(countResult.rows[0].total);
        values.push(limit, offset);
        const result = await (0, database_js_1.query)(`SELECT f.* FROM families f ${whereClause} ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, values);
        const families = [];
        for (const row of result.rows) {
            families.push(await this.getById(row.id));
        }
        return { families, total };
    }
    mapFamily(row) {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            rootPersonId: row.root_person_id,
            status: row.status,
            createdBy: row.created_by,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    mapPerson(row) {
        return {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            dateOfBirth: row.date_of_birth,
            dateOfDeath: row.date_of_death,
            profileImageUrl: row.profile_image_url,
            familyId: row.family_id,
            createdBy: row.created_by,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.FamilyService = FamilyService;
exports.familyService = new FamilyService();
//# sourceMappingURL=family.service.js.map