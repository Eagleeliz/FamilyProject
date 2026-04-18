"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personService = exports.PersonService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
const helpers_js_1 = require("../utils/helpers.js");
class PersonService {
    async create(input, userId) {
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [input.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not a member of this family');
        }
        const result = await (0, database_js_1.query)(`INSERT INTO persons (first_name, last_name, date_of_birth, date_of_death, profile_image_url, family_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
       RETURNING *`, [
            input.firstName,
            input.lastName,
            input.dateOfBirth || null,
            input.dateOfDeath || null,
            input.profileImageUrl || null,
            input.familyId,
            userId,
        ]);
        return this.mapPerson(result.rows[0]);
    }
    async getById(id) {
        const result = await (0, database_js_1.query)('SELECT * FROM persons WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Person not found');
        }
        return this.mapPerson(result.rows[0]);
    }
    async update(id, data, userId) {
        const person = await this.getById(id);
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not authorized to edit this person');
        }
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
        if (data.dateOfBirth !== undefined) {
            updates.push(`date_of_birth = $${paramIndex++}`);
            values.push(data.dateOfBirth || null);
        }
        if (data.dateOfDeath !== undefined) {
            updates.push(`date_of_death = $${paramIndex++}`);
            values.push(data.dateOfDeath || null);
        }
        if (data.profileImageUrl !== undefined) {
            updates.push(`profile_image_url = $${paramIndex++}`);
            values.push(data.profileImageUrl || null);
        }
        if (updates.length === 0) {
            throw new errors_js_1.BadRequestError('No fields to update');
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        const result = await (0, database_js_1.query)(`UPDATE persons SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
        return this.mapPerson(result.rows[0]);
    }
    async delete(id, userId) {
        const person = await this.getById(id);
        const membership = await (0, database_js_1.query)('SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not authorized to delete this person');
        }
        await (0, database_js_1.query)('DELETE FROM relationships WHERE person_id = $1 OR related_person_id = $1', [id]);
        await (0, database_js_1.query)('DELETE FROM persons WHERE id = $1', [id]);
    }
    async search(queryStr, page = 1, limit = 20) {
        const sanitized = (0, helpers_js_1.sanitizeSearchQuery)(queryStr);
        if (sanitized.length < 2) {
            throw new errors_js_1.BadRequestError('Search query must be at least 2 characters');
        }
        const offset = (page - 1) * limit;
        const searchPattern = `%${sanitized}%`;
        const countResult = await (0, database_js_1.query)(`SELECT COUNT(*) as total FROM persons p
       LEFT JOIN families f ON p.family_id = f.id
       WHERE (p.first_name ILIKE $1 OR p.last_name ILIKE $1)
       AND p.status = 'approved'`, [searchPattern]);
        const total = parseInt(countResult.rows[0].total);
        const result = await (0, database_js_1.query)(`SELECT p.*, f.name as family_name
       FROM persons p
       LEFT JOIN families f ON p.family_id = f.id
       WHERE (p.first_name ILIKE $1 OR p.last_name ILIKE $1)
       AND p.status = 'approved'
       ORDER BY p.last_name, p.first_name
       LIMIT $2 OFFSET $3`, [searchPattern, limit, offset]);
        const persons = result.rows.map((row) => ({
            ...this.mapPerson(row),
            familyName: row.family_name,
        }));
        return {
            persons,
            pagination: (0, helpers_js_1.generatePagination)(page, limit, total),
        };
    }
    async getFamilyTree(familyId, userId) {
        if (userId) {
            const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [familyId, userId, 'approved']);
            if (membership.rows.length === 0) {
                throw new errors_js_1.ForbiddenError('Not a member of this family');
            }
        }
        const personsResult = await (0, database_js_1.query)('SELECT * FROM persons WHERE family_id = $1 AND status = $2', [familyId, 'approved']);
        const relationshipsResult = await (0, database_js_1.query)(`SELECT r.* FROM relationships r
       JOIN persons p ON r.person_id = p.id OR r.related_person_id = p.id
       WHERE p.family_id = $1`, [familyId]);
        const persons = personsResult.rows.map((row) => this.mapPerson(row));
        const relationships = relationshipsResult.rows;
        const tree = this.buildTree(persons, relationships);
        return tree;
    }
    buildTree(persons, relationships) {
        const personMap = new Map();
        const parentChildMap = new Map();
        for (const person of persons) {
            personMap.set(person.id, person);
            parentChildMap.set(person.id, { parents: [], children: [], siblings: [], spouses: [] });
        }
        for (const rel of relationships) {
            const personId = rel.person_id;
            const relatedId = rel.related_person_id;
            const type = rel.relationship_type;
            const mapping = parentChildMap.get(personId);
            if (!mapping)
                continue;
            switch (type) {
                case 'parent':
                    mapping.parents.push(relatedId);
                    break;
                case 'child':
                    mapping.children.push(relatedId);
                    break;
                case 'sibling':
                    mapping.siblings.push(relatedId);
                    break;
                case 'spouse':
                    mapping.spouses.push(relatedId);
                    break;
            }
        }
        const visited = new Set();
        const tree = [];
        const buildNode = (personId, level) => {
            if (visited.has(personId))
                return null;
            visited.add(personId);
            const person = personMap.get(personId);
            if (!person)
                return null;
            const mapping = parentChildMap.get(personId) || { parents: [], children: [], siblings: [], spouses: [] };
            const node = {
                person,
                children: [],
                parents: [],
                siblings: [],
                spouse: null,
                level,
            };
            for (const childId of mapping.children) {
                const childNode = buildNode(childId, level + 1);
                if (childNode)
                    node.children.push(childNode);
            }
            for (const parentId of mapping.parents) {
                const parentNode = buildNode(parentId, level - 1);
                if (parentNode)
                    node.parents.push(parentNode);
            }
            if (mapping.siblings[0]) {
                node.siblings = mapping.siblings
                    .map((id) => personMap.get(id))
                    .filter((p) => p !== undefined);
            }
            if (mapping.spouses[0]) {
                node.spouse = personMap.get(mapping.spouses[0]) || null;
            }
            return node;
        };
        for (const person of persons) {
            const mapping = parentChildMap.get(person.id);
            if (mapping && mapping.parents.length === 0) {
                const rootNode = buildNode(person.id, 0);
                if (rootNode)
                    tree.push(rootNode);
            }
        }
        return tree;
    }
    async getPending(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const countResult = await (0, database_js_1.query)("SELECT COUNT(*) as total FROM persons WHERE status = 'pending'");
        const total = parseInt(countResult.rows[0].total);
        const result = await (0, database_js_1.query)("SELECT * FROM persons WHERE status = 'pending' ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        return {
            persons: result.rows.map((row) => this.mapPerson(row)),
            total,
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
exports.PersonService = PersonService;
exports.personService = new PersonService();
//# sourceMappingURL=person.service.js.map