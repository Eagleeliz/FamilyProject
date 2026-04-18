import { query } from '../config/database.js';
import { Family, Person } from '../types/index.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { notificationService } from './notification.service.js';

interface CreateFamilyInput {
  name: string;
  description?: string;
  rootPersonName?: string;
}

interface FamilyWithDetails extends Family {
  rootPerson?: Person;
  memberCount?: number;
}

export class FamilyService {
  async create(familyData: CreateFamilyInput, userId: string): Promise<FamilyWithDetails> {
    const client = await (await import('../config/database.js')).pool.connect();
    
    try {
      await client.query('BEGIN');

      const familyResult = await client.query(
        `INSERT INTO families (name, description, status, created_by) 
         VALUES ($1, $2, 'approved', $3) 
         RETURNING *`,
        [familyData.name, familyData.description || null, userId]
      );

      const family = familyResult.rows[0];

      let rootPerson: Person | null = null;
      if (familyData.rootPersonName) {
        const nameParts = familyData.rootPersonName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || familyData.name;

        const personResult = await client.query(
          `INSERT INTO persons (first_name, last_name, family_id, created_by, status) 
           VALUES ($1, $2, $3, $4, 'approved') 
           RETURNING *`,
          [firstName, lastName, family.id, userId]
        );

        rootPerson = this.mapPerson(personResult.rows[0]);

        await client.query(
          'UPDATE families SET root_person_id = $1 WHERE id = $2',
          [rootPerson.id, family.id]
        );
      }

      await client.query(
        `INSERT INTO family_members (user_id, family_id, role, status) 
         VALUES ($1, $2, 'admin', 'approved')`,
        [userId, family.id]
      );

      await client.query('COMMIT');

      return {
        ...this.mapFamily(family),
        rootPerson: rootPerson || undefined,
        memberCount: 1,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getById(id: string, userId?: string): Promise<FamilyWithDetails> {
    const result = await query('SELECT * FROM families WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new NotFoundError('Family not found');
    }

    const family = this.mapFamily(result.rows[0]);

    let rootPerson: Person | undefined;
    if (family.rootPersonId) {
      const personResult = await query('SELECT * FROM persons WHERE id = $1', [family.rootPersonId]);
      if (personResult.rows.length > 0) {
        rootPerson = this.mapPerson(personResult.rows[0]);
      }
    }

    const memberCountResult = await query(
      'SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND status = $2',
      [id, 'approved']
    );

    return {
      ...family,
      rootPerson,
      memberCount: parseInt(memberCountResult.rows[0].count),
    };
  }

  async getUserFamilies(userId: string): Promise<FamilyWithDetails[]> {
    const result = await query(
      `SELECT f.*, fm.role as member_role 
       FROM families f
       JOIN family_members fm ON f.id = fm.family_id
       WHERE fm.user_id = $1 AND fm.status = 'approved' AND f.status = 'approved'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const families: FamilyWithDetails[] = [];
    for (const row of result.rows) {
      const family = this.mapFamily(row);
      
      let rootPerson: Person | undefined;
      if (family.rootPersonId) {
        const personResult = await query('SELECT * FROM persons WHERE id = $1', [family.rootPersonId]);
        if (personResult.rows.length > 0) {
          rootPerson = this.mapPerson(personResult.rows[0]);
        }
      }

      const memberCountResult = await query(
        'SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND status = $2',
        [family.id, 'approved']
      );

      families.push({
        ...family,
        rootPerson,
        memberCount: parseInt(memberCountResult.rows[0].count),
      });
    }

    return families;
  }

  async update(id: string, data: { name?: string; description?: string }, userId: string, userRole: string): Promise<FamilyWithDetails> {
    const membership = await query(
      'SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [id, userId, 'approved']
    );

    if (membership.rows.length === 0 && userRole !== 'admin') {
      throw new ForbiddenError('Not a member of this family');
    }

    if (membership.rows[0]?.role !== 'admin' && userRole !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const updates: string[] = [];
    const values: unknown[] = [];
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
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE families SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return this.getById(result.rows[0].id);
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const membership = await query(
      'SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [id, userId, 'approved']
    );

    if (userRole !== 'admin' && membership.rows[0]?.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    await query('DELETE FROM families WHERE id = $1', [id]);
  }

  async joinRequest(familyId: string, userId: string): Promise<void> {
    const existing = await query(
      'SELECT id FROM family_members WHERE user_id = $1 AND family_id = $2',
      [userId, familyId]
    );

    if (existing.rows.length > 0) {
      throw new BadRequestError('Already a member or pending');
    }

    await query(
      'INSERT INTO family_members (user_id, family_id, role, status) VALUES ($1, $2, $3, $4)',
      [userId, familyId, 'member', 'pending']
    );

    const familyResult = await query('SELECT name FROM families WHERE id = $1', [familyId]);
    const familyName = familyResult.rows[0]?.name || 'Unknown Family';

    const userResult = await query('SELECT first_name, last_name FROM users WHERE id = $1', [userId]);
    const userName = `${userResult.rows[0]?.first_name || ''} ${userResult.rows[0]?.last_name || ''}`.trim();

    const adminsResult = await query(
      `SELECT user_id FROM family_members WHERE family_id = $1 AND role = 'admin' AND status = 'approved'`,
      [familyId]
    );

    for (const adminRow of adminsResult.rows) {
      await notificationService.create({
        userId: adminRow.user_id,
        type: 'join_request',
        title: 'New Join Request',
        message: `${userName} has requested to join ${familyName}`,
        relatedId: familyId,
      });
    }
  }

  async approveMember(familyId: string, userId: string, approverId: string): Promise<void> {
    const familyResult = await query('SELECT created_by FROM families WHERE id = $1', [familyId]);
    const familyCreator = familyResult.rows[0]?.created_by;

    if (familyCreator !== approverId) {
      throw new ForbiddenError('Only the family creator can approve join requests');
    }

    const result = await query(
      `UPDATE family_members SET status = 'approved' WHERE user_id = $1 AND family_id = $2 AND status = 'pending' RETURNING id`,
      [userId, familyId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Pending membership not found');
    }

    const familyNameResult = await query('SELECT name FROM families WHERE id = $1', [familyId]);
    const familyName = familyNameResult.rows[0]?.name || 'Unknown Family';

    await notificationService.create({
      userId,
      type: 'member_approved',
      title: 'Membership Approved',
      message: `Your request to join ${familyName} has been approved!`,
      relatedId: familyId,
    });
  }

  async rejectMember(familyId: string, userId: string, approverId: string): Promise<void> {
    const familyResult = await query('SELECT created_by FROM families WHERE id = $1', [familyId]);
    const familyCreator = familyResult.rows[0]?.created_by;

    if (familyCreator !== approverId) {
      throw new ForbiddenError('Only the family creator can reject join requests');
    }

    const result = await query(
      `DELETE FROM family_members WHERE user_id = $1 AND family_id = $2 AND status = 'pending' RETURNING id`,
      [userId, familyId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Pending membership not found');
    }

    const familyResult1= await query('SELECT name FROM families WHERE id = $1', [familyId]);
    const familyName = familyResult1.rows[0]?.name || 'Unknown Family';

    await notificationService.create({
      userId,
      type: 'member_rejected',
      title: 'Membership Rejected',
      message: `Your request to join ${familyName} has been rejected.`,
      relatedId: familyId,
    });
  }

  async leave(familyId: string, userId: string): Promise<void> {
    const membership = await query(
      'SELECT role FROM family_members WHERE family_id = $1 AND user_id = $2 AND status = $3',
      [userId, familyId, 'approved']
    );

    if (membership.rows.length === 0) {
      throw new NotFoundError('Membership not found');
    }

    if (membership.rows[0].role === 'admin') {
      const adminCount = await query(
        `SELECT COUNT(*) as count FROM family_members WHERE family_id = $1 AND role = 'admin' AND status = $2`,
        [familyId, 'approved']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        throw new BadRequestError('Cannot leave: you are the only admin');
      }
    }

    await query('DELETE FROM family_members WHERE user_id = $1 AND family_id = $2', [userId, familyId]);
  }

  async getAll(page = 1, limit = 20, status?: string): Promise<{ families: FamilyWithDetails[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const values: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause = `WHERE f.status = $${paramIndex++}`;
      values.push(status);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM families f ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].total);

    values.push(limit, offset);
    const result = await query(
      `SELECT f.* FROM families f ${whereClause} ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    const families: FamilyWithDetails[] = [];
    for (const row of result.rows) {
      families.push(await this.getById(row.id));
    }

    return { families, total };
  }

  async getPublicFamilies(): Promise<FamilyWithDetails[]> {
    const result = await query(
      `SELECT * FROM families WHERE status = 'approved' ORDER BY name ASC`
    );

    const families: FamilyWithDetails[] = [];
    for (const row of result.rows) {
      families.push(await this.getById(row.id));
    }

    return families;
  }

  async getPendingMembers(familyId: string, userId: string): Promise<{ id: string; userId: string; firstName: string; lastName: string; email: string }[]> {
    const familyResult = await query('SELECT created_by FROM families WHERE id = $1', [familyId]);
    const familyCreator = familyResult.rows[0]?.created_by;

    if (familyCreator !== userId) {
      throw new ForbiddenError('Only the family creator can view pending join requests');
    }

    const result = await query(
      `SELECT fm.id, fm.user_id, u.first_name, u.last_name, u.email 
       FROM family_members fm
       JOIN users u ON fm.user_id = u.id
       WHERE fm.family_id = $1 AND fm.status = 'pending'`,
      [familyId]
    );

    return result.rows.map(row => ({
      id: row.id as string,
      userId: row.user_id as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      email: row.email as string,
    }));
  }

  private mapFamily(row: Record<string, unknown>): Family {
    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | null,
      rootPersonId: row.root_person_id as string | null,
      status: row.status as 'pending' | 'approved' | 'rejected',
      createdBy: row.created_by as string,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
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

export const familyService = new FamilyService();
