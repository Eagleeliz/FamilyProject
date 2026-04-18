import { query } from '../config/database.js';

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalFamilies: number;
  approvedFamilies: number;
  pendingFamilies: number;
  totalPersons: number;
  approvedPersons: number;
  pendingPersons: number;
  recentSignups: { date: string; count: number }[];
  recentFamilies: { date: string; count: number }[];
}

export class AnalyticsService {
  async getAnalytics(): Promise<Analytics> {
    const [usersCount, familiesCount, personsCount, recentSignups, recentFamilies] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked
        FROM users
      `),
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM families
      `),
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM persons
      `),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
      query(`
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

  async getAllUsers(page = 1, limit = 20, status?: string): Promise<{ users: Record<string, unknown>[]; total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const values: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause = `WHERE status = $${paramIndex++}`;
      values.push(status);
    }

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].total);

    values.push(limit, offset);
    const result = await query(
      `SELECT id, email, first_name, last_name, role, status, created_at, updated_at 
       FROM users ${whereClause}
       ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

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

  async updateUserStatus(userId: string, status: 'active' | 'blocked'): Promise<void> {
    await query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, userId]);
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);
  }

  async approveFamily(familyId: string): Promise<void> {
    await query("UPDATE families SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [familyId]);
  }

  async rejectFamily(familyId: string): Promise<void> {
    await query("UPDATE families SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [familyId]);
  }

  async approvePerson(personId: string): Promise<void> {
    await query("UPDATE persons SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [personId]);
  }

  async rejectPerson(personId: string): Promise<void> {
    await query("UPDATE persons SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [personId]);
  }
}

export const analyticsService = new AnalyticsService();
