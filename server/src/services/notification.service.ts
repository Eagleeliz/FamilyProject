import { query } from '../config/database.js';
import { Notification } from '../types/index.js';

export class NotificationService {
  async create(data: {
    userId: string;
    type: Notification['type'];
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<Notification> {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, related_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.userId, data.type, data.title, data.message, data.relatedId || null]
    );

    return this.mapNotification(result.rows[0]);
  }

  async getByUserId(userId: string, limit = 20): Promise<Notification[]> {
    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.map(this.mapNotification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await query(
      `UPDATE notifications SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [userId]
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  private mapNotification(row: Record<string, unknown>): Notification {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      type: row.type as Notification['type'],
      title: row.title as string,
      message: row.message as string,
      relatedId: row.related_id as string | undefined,
      isRead: row.is_read as boolean,
      createdAt: row.created_at as Date,
    };
  }
}

export const notificationService = new NotificationService();