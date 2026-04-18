import { query } from '../config/database.js';
import { Relationship, Person, CousinResult } from '../types/index.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

interface CreateRelationshipInput {
  personId: string;
  relatedPersonId: string;
  relationshipType: 'parent' | 'child' | 'sibling' | 'spouse';
}

export class RelationshipService {
  async create(input: CreateRelationshipInput, userId: string): Promise<Relationship[]> {
    if (input.personId === input.relatedPersonId) {
      throw new BadRequestError('Cannot create relationship with self');
    }

    const person = await this.getPerson(input.personId);
    const relatedPerson = await this.getPerson(input.relatedPersonId);

    if (person.familyId !== relatedPerson.familyId) {
      throw new BadRequestError('Both persons must be in the same family');
    }

    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not a member of this family');
    }

    const existing = await query(
      'SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
      [input.personId, input.relatedPersonId, input.relationshipType]
    );

    if (existing.rows.length > 0) {
      throw new BadRequestError('Relationship already exists');
    }

    const createdRelationships: Relationship[] = [];

    const result = await query(
      `INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.personId, input.relatedPersonId, input.relationshipType, userId]
    );
    createdRelationships.push(this.mapRelationship(result.rows[0]));

    if (input.relationshipType === 'parent') {
      const existingChild = await query(
        'SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [input.relatedPersonId, input.personId, 'child']
      );
      if (existingChild.rows.length === 0) {
        const childResult = await query(
          `INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [input.relatedPersonId, input.personId, 'child', userId]
        );
        createdRelationships.push(this.mapRelationship(childResult.rows[0]));
      }
    } else if (input.relationshipType === 'child') {
      const existingParent = await query(
        'SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [input.relatedPersonId, input.personId, 'parent']
      );
      if (existingParent.rows.length === 0) {
        const parentResult = await query(
          `INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [input.relatedPersonId, input.personId, 'parent', userId]
        );
        createdRelationships.push(this.mapRelationship(parentResult.rows[0]));
      }
    } else if (input.relationshipType === 'sibling') {
      const existingSibling = await query(
        'SELECT id FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [input.relatedPersonId, input.personId, 'sibling']
      );
      if (existingSibling.rows.length === 0) {
        const siblingResult = await query(
          `INSERT INTO relationships (person_id, related_person_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [input.relatedPersonId, input.personId, 'sibling', userId]
        );
        createdRelationships.push(this.mapRelationship(siblingResult.rows[0]));
      }
    }

    return createdRelationships;
  }

  async delete(id: string, userId: string): Promise<void> {
    const relResult = await query('SELECT * FROM relationships WHERE id = $1', [id]);
    if (relResult.rows.length === 0) {
      throw new NotFoundError('Relationship not found');
    }

    const rel = relResult.rows[0];
    const person = await this.getPerson(rel.person_id);

    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not authorized');
    }

    await query('DELETE FROM relationships WHERE id = $1', [id]);

    if (rel.relationship_type === 'parent') {
      await query(
        'DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [rel.related_person_id, rel.person_id, 'child']
      );
    } else if (rel.relationship_type === 'child') {
      await query(
        'DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [rel.related_person_id, rel.person_id, 'parent']
      );
    } else if (rel.relationship_type === 'sibling') {
      await query(
        'DELETE FROM relationships WHERE person_id = $1 AND related_person_id = $2 AND relationship_type = $3',
        [rel.related_person_id, rel.person_id, 'sibling']
      );
    }
  }

  async getRelatives(personId: string, userId: string): Promise<{ parents: Person[]; children: Person[]; siblings: Person[]; spouses: Person[] }> {
    const person = await this.getPerson(personId);

    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not a member of this family');
    }

    const parents = await this.getRelatedPersons(personId, 'parent');
    const children = await this.getRelatedPersons(personId, 'child');
    const siblings = await this.getRelatedPersons(personId, 'sibling');
    const spouses = await this.getRelatedPersons(personId, 'spouse');

    return { parents, children, siblings, spouses };
  }

  async getCousins(personId: string, userId: string, maxDegree = 3): Promise<CousinResult[]> {
    const person = await this.getPerson(personId);

    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not a member of this family');
    }

    const results: CousinResult[] = [];

    for (let degree = 1; degree <= maxDegree; degree++) {
      const cousins = await this.findCousinsOfDegree(personId, degree);
      results.push({ degree, cousins });
    }

    return results;
  }

  private async findCousinsOfDegree(personId: string, degree: number): Promise<Person[]> {
    let ancestors: string[] = [personId];
    
    for (let i = 0; i < degree; i++) {
      const newAncestors: string[] = [];
      for (const ancestorId of ancestors) {
        const parents = await this.getRelatedPersons(ancestorId, 'parent');
        newAncestors.push(...parents.map((p) => p.id));
      }
      ancestors = [...new Set(newAncestors)];
    }

    if (ancestors.length === 0) return [];

    const auntsUncles: Person[] = [];
    for (const parentId of ancestors) {
      const siblings = await this.getRelatedPersons(parentId, 'sibling');
      auntsUncles.push(...siblings);
    }

    const uniqueAuntsUncles = auntsUncles.filter((p, index, self) => 
      index === self.findIndex((t) => t.id === p.id)
    );

    const cousins: Person[] = [];
    for (const auntUncle of uniqueAuntsUncles) {
      const children = await this.getRelatedPersons(auntUncle.id, 'child');
      cousins.push(...children);
    }

    const uniqueCousins = cousins.filter((p, index, self) => 
      index === self.findIndex((t) => t.id === p.id) && p.id !== personId
    );

    return uniqueCousins;
  }

  private async getRelatedPersons(personId: string, relationshipType: string): Promise<Person[]> {
    const result = await query(
      `SELECT p.* FROM persons p
       JOIN relationships r ON p.id = r.related_person_id
       WHERE r.person_id = $1 AND r.relationship_type = $2`,
      [personId, relationshipType]
    );

    return result.rows.map((row) => ({
      id: row.id as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      dateOfBirth: row.date_of_birth as Date | null,
      dateOfDeath: row.date_of_death as Date | null,
      profileImageUrl: row.profile_image_url as string | null,
      familyId: row.family_id as string | null,
      createdBy: row.created_by as string,
      status: row.status as 'pending' | 'approved' | 'rejected',
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    }));
  }

  private async getPerson(personId: string): Promise<Person> {
    const result = await query('SELECT * FROM persons WHERE id = $1', [personId]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Person not found');
    }
    const row = result.rows[0];
    return {
      id: row.id as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      dateOfBirth: row.date_of_birth as Date | null,
      dateOfDeath: row.date_of_death as Date | null,
      profileImageUrl: row.profile_image_url as string | null,
      familyId: row.family_id as string | null,
      createdBy: row.created_by as string,
      status: row.status as 'pending' | 'approved' | 'rejected',
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  private mapRelationship(row: Record<string, unknown>): Relationship {
    return {
      id: row.id as string,
      personId: row.person_id as string,
      relatedPersonId: row.related_person_id as string,
      relationshipType: row.relationship_type as 'parent' | 'child' | 'sibling' | 'spouse',
      createdBy: row.created_by as string,
      createdAt: row.created_at as Date,
    };
  }
}

export const relationshipService = new RelationshipService();
