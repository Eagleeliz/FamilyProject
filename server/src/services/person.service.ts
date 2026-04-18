import { query } from '../config/database.js';
import { Person, TreeNode } from '../types/index.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { sanitizeSearchQuery, generatePagination } from '../utils/helpers.js';

interface CreatePersonInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  profileImageUrl?: string;
  familyId: string;
}

interface UpdatePersonInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  profileImageUrl?: string;
}

export class PersonService {
  async create(input: CreatePersonInput, userId: string): Promise<Person> {
    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [input.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not a member of this family');
    }

    const result = await query(
      `INSERT INTO persons (first_name, last_name, date_of_birth, date_of_death, profile_image_url, family_id, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved')
       RETURNING *`,
      [
        input.firstName,
        input.lastName,
        input.dateOfBirth || null,
        input.dateOfDeath || null,
        input.profileImageUrl || null,
        input.familyId,
        userId,
      ]
    );

    return this.mapPerson(result.rows[0]);
  }

  async getById(id: string): Promise<Person> {
    const result = await query('SELECT * FROM persons WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Person not found');
    }
    return this.mapPerson(result.rows[0]);
  }

  async update(id: string, data: UpdatePersonInput, userId: string): Promise<Person> {
    const person = await this.getById(id);

    const membership = await query(
      'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not authorized to edit this person');
    }

    const updates: string[] = [];
    const values: unknown[] = [];
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
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE persons SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return this.mapPerson(result.rows[0]);
  }

  async delete(id: string, userId: string): Promise<void> {
    const person = await this.getById(id);

    const membership = await query(
      'SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [person.familyId, userId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new ForbiddenError('Not authorized to delete this person');
    }

    await query('DELETE FROM relationships WHERE person_id = $1 OR related_person_id = $1', [id]);
    await query('DELETE FROM persons WHERE id = $1', [id]);
  }

  async search(queryStr: string, page = 1, limit = 20): Promise<{ persons: (Person & { familyName?: string })[]; pagination: ReturnType<typeof generatePagination> }> {
    const sanitized = sanitizeSearchQuery(queryStr);
    if (sanitized.length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters');
    }

    const offset = (page - 1) * limit;
    const searchPattern = `%${sanitized}%`;

    const countResult = await query(
      `SELECT COUNT(*) as total FROM persons p
       LEFT JOIN families f ON p.family_id = f.id
       WHERE (p.first_name ILIKE $1 OR p.last_name ILIKE $1)
       AND p.status = 'approved'`,
      [searchPattern]
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await query(
      `SELECT p.*, f.name as family_name
       FROM persons p
       LEFT JOIN families f ON p.family_id = f.id
       WHERE (p.first_name ILIKE $1 OR p.last_name ILIKE $1)
       AND p.status = 'approved'
       ORDER BY p.last_name, p.first_name
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset]
    );

    const persons = result.rows.map((row) => ({
      ...this.mapPerson(row),
      familyName: row.family_name as string | undefined,
    }));

    return {
      persons,
      pagination: generatePagination(page, limit, total),
    };
  }

  async getFamilyTree(familyId: string, userId?: string): Promise<TreeNode[]> {
    if (userId) {
      const membership = await query(
        'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
        [familyId, userId, 'approved']
      );

      if (membership.rows.length === 0) {
        throw new ForbiddenError('Not a member of this family');
      }
    }

    const personsResult = await query(
      'SELECT * FROM persons WHERE family_id = $1 AND status = $2',
      [familyId, 'approved']
    );

    const relationshipsResult = await query(
      `SELECT r.* FROM relationships r
       JOIN persons p ON r.person_id = p.id OR r.related_person_id = p.id
       WHERE p.family_id = $1`,
      [familyId]
    );

    const persons = personsResult.rows.map((row) => this.mapPerson(row));
    const relationships = relationshipsResult.rows;

    const tree = this.buildTree(persons, relationships);
    return tree;
  }

  private buildTree(persons: Person[], relationships: Record<string, unknown>[]): TreeNode[] {
    const personMap = new Map<string, Person>();
    const parentChildMap = new Map<string, { parents: string[]; children: string[]; siblings: string[]; spouses: string[] }>();

    for (const person of persons) {
      personMap.set(person.id, person);
      parentChildMap.set(person.id, { parents: [], children: [], siblings: [], spouses: [] });
    }

    for (const rel of relationships) {
      const personId = rel.person_id as string;
      const relatedId = rel.related_person_id as string;
      const type = rel.relationship_type as string;

      const mapping = parentChildMap.get(personId);
      if (!mapping) continue;

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

    const visited = new Set<string>();
    const tree: TreeNode[] = [];

    const buildNode = (personId: string, level: number): TreeNode | null => {
      if (visited.has(personId)) return null;
      visited.add(personId);

      const person = personMap.get(personId);
      if (!person) return null;

      const mapping = parentChildMap.get(personId) || { parents: [], children: [], siblings: [], spouses: [] };

      const node: TreeNode = {
        person,
        children: [],
        parents: [],
        siblings: [],
        spouse: null,
        level,
      };

      for (const childId of mapping.children) {
        const childNode = buildNode(childId, level + 1);
        if (childNode) node.children.push(childNode);
      }

      for (const parentId of mapping.parents) {
        const parentNode = buildNode(parentId, level - 1);
        if (parentNode) node.parents.push(parentNode);
      }

      if (mapping.siblings[0]) {
        node.siblings = mapping.siblings
          .map((id) => personMap.get(id))
          .filter((p): p is Person => p !== undefined);
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
        if (rootNode) tree.push(rootNode);
      }
    }

    return tree;
  }

  async getPending(page = 1, limit = 20): Promise<{ persons: Person[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await query(
      "SELECT COUNT(*) as total FROM persons WHERE status = 'pending'"
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await query(
      "SELECT * FROM persons WHERE status = 'pending' ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    return {
      persons: result.rows.map((row) => this.mapPerson(row)),
      total,
    };
  }

  private mapPerson(row: Record<string, unknown>): Person {
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
}

export const personService = new PersonService();
