"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipService = exports.RelationshipService = void 0;
const database_js_1 = require("../config/database.js");
const errors_js_1 = require("../utils/errors.js");
class RelationshipService {
    async create(input, userId) {
        if (input.personId === input.relatedPersonId) {
            throw new errors_js_1.BadRequestError('Cannot create relationship with self');
        }
        const person = await this.getPerson(input.personId);
        const relatedPerson = await this.getPerson(input.relatedPersonId);
        if (person.familyId !== relatedPerson.familyId) {
            throw new errors_js_1.BadRequestError('Both persons must be in the same family');
        }
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not a member of this family');
        }
        const existing = await (0, database_js_1.query)('SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [input.personId, input.relatedPersonId, input.relationshipType]);
        if (existing.rows.length > 0) {
            throw new errors_js_1.BadRequestError('Relationship already exists');
        }
        const createdRelationships = [];
        const result = await (0, database_js_1.query)(`INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`, [input.personId, input.relatedPersonId, input.relationshipType, userId]);
        createdRelationships.push(this.mapRelationship(result.rows[0]));
        if (input.relationshipType === 'parent') {
            const existingChild = await (0, database_js_1.query)('SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [input.relatedPersonId, input.personId, 'child']);
            if (existingChild.rows.length === 0) {
                const childResult = await (0, database_js_1.query)(`INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`, [input.relatedPersonId, input.personId, 'child', userId]);
                createdRelationships.push(this.mapRelationship(childResult.rows[0]));
            }
        }
        else if (input.relationshipType === 'child') {
            const existingParent = await (0, database_js_1.query)('SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [input.relatedPersonId, input.personId, 'parent']);
            if (existingParent.rows.length === 0) {
                const parentResult = await (0, database_js_1.query)(`INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`, [input.relatedPersonId, input.personId, 'parent', userId]);
                createdRelationships.push(this.mapRelationship(parentResult.rows[0]));
            }
        }
        else if (input.relationshipType === 'sibling') {
            const existingSibling = await (0, database_js_1.query)('SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [input.relatedPersonId, input.personId, 'sibling']);
            if (existingSibling.rows.length === 0) {
                const siblingResult = await (0, database_js_1.query)(`INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`, [input.relatedPersonId, input.personId, 'sibling', userId]);
                createdRelationships.push(this.mapRelationship(siblingResult.rows[0]));
            }
        }
        return createdRelationships;
    }
    async delete(id, userId) {
        const relResult = await (0, database_js_1.query)('SELECT * FROM relationships WHERE id = $1', [id]);
        if (relResult.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Relationship not found');
        }
        const rel = relResult.rows[0];
        const person = await this.getPerson(rel.person_id);
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not authorized');
        }
        await (0, database_js_1.query)('DELETE FROM relationships WHERE id = $1', [id]);
        if (rel.relationship_type === 'parent') {
            await (0, database_js_1.query)('DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [rel.related_person_id, rel.person_id, 'child']);
        }
        else if (rel.relationship_type === 'child') {
            await (0, database_js_1.query)('DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [rel.related_person_id, rel.person_id, 'parent']);
        }
        else if (rel.relationship_type === 'sibling') {
            await (0, database_js_1.query)('DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3', [rel.related_person_id, rel.person_id, 'sibling']);
        }
    }
    async getRelatives(personId, userId) {
        const person = await this.getPerson(personId);
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not a member of this family');
        }
        const parents = await this.getRelatedPersons(personId, 'parent');
        const children = await this.getRelatedPersons(personId, 'child');
        const siblings = await this.getRelatedPersons(personId, 'sibling');
        const spouses = await this.getRelatedPersons(personId, 'spouse');
        return { parents, children, siblings, spouses };
    }
    async getCousins(personId, userId, maxDegree = 3) {
        const person = await this.getPerson(personId);
        const membership = await (0, database_js_1.query)('SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3', [person.familyId, userId, 'approved']);
        if (membership.rows.length === 0) {
            throw new errors_js_1.ForbiddenError('Not a member of this family');
        }
        const results = [];
        for (let degree = 1; degree <= maxDegree; degree++) {
            const cousins = await this.findCousinsOfDegree(personId, degree);
            results.push({ degree, cousins });
        }
        return results;
    }
    async findCousinsOfDegree(personId, degree) {
        let ancestors = [personId];
        for (let i = 0; i < degree; i++) {
            const newAncestors = [];
            for (const ancestorId of ancestors) {
                const parents = await this.getRelatedPersons(ancestorId, 'parent');
                newAncestors.push(...parents.map((p) => p.id));
            }
            ancestors = [...new Set(newAncestors)];
        }
        if (ancestors.length === 0)
            return [];
        const auntsUncles = [];
        for (const parentId of ancestors) {
            const siblings = await this.getRelatedPersons(parentId, 'sibling');
            auntsUncles.push(...siblings);
        }
        const uniqueAuntsUncles = auntsUncles.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id));
        const cousins = [];
        for (const auntUncle of uniqueAuntsUncles) {
            const children = await this.getRelatedPersons(auntUncle.id, 'child');
            cousins.push(...children);
        }
        const uniqueCousins = cousins.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id) && t.id !== personId);
        return uniqueCousins;
    }
    async getRelatedPersons(personId, relationshipType) {
        const result = await (0, database_js_1.query)(`SELECT p.* FROM persons p
       JOIN relationships r ON p.id = r.related_person_id
       WHERE r.person_id = $1 AND r.relationship_type = $2`, [personId, relationshipType]);
        return result.rows.map((row) => ({
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
        }));
    }
    async getPerson(personId) {
        const result = await (0, database_js_1.query)('SELECT * FROM persons WHERE id = $1', [personId]);
        if (result.rows.length === 0) {
            throw new errors_js_1.NotFoundError('Person not found');
        }
        const row = result.rows[0];
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
    mapRelationship(row) {
        return {
            id: row.id,
            personId: row.person_id,
            relatedPersonId: row.related_person_id,
            relationshipType: row.relationship_type,
            createdBy: row.created_by,
            createdAt: row.created_at,
        };
    }
}
exports.RelationshipService = RelationshipService;
exports.relationshipService = new RelationshipService();
//# sourceMappingURL=relationship.service.js.map