import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { config } from '../config/index.js';
import { User, JwtPayload } from '../types/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  expiresIn: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    const existing = await query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw new BadRequestError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, first_name, last_name, role, status, created_at, updated_at`,
      [input.email.toLowerCase(), passwordHash, input.firstName, input.lastName]
    );

    const user = result.rows[0];
    const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });
    
    return {
      user: this.mapUser(user),
      tokens,
    };
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND status = $2',
      [input.email.toLowerCase(), 'active']
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(input.password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.generateTokens({ userId: user.id, email: user.email, role: user.role });

    return {
      user: this.mapUser(user),
      tokens,
    };
  }

  async getMe(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, status, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return this.mapUser(result.rows[0]);
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }): Promise<Omit<User, 'passwordHash'>> {
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
    if (data.email) {
      const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [data.email.toLowerCase(), userId]);
      if (existing.rows.length > 0) {
        throw new BadRequestError('Email already in use');
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email.toLowerCase());
    }

    if (updates.length === 0) {
      throw new BadRequestError('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, email, first_name, last_name, role, status, created_at, updated_at`,
      values
    );

    return this.mapUser(result.rows[0]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, userId]
    );
  }

  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, config.jwtSecret, { 
  expiresIn: config.jwtExpiresIn as any
});

    return { accessToken, expiresIn: config.jwtExpiresIn };
  }

  private mapUser(row: Record<string, unknown>): Omit<User, 'passwordHash'> {
    return {
      id: row.id as string,
      email: row.email as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      role: row.role as 'user' | 'admin',
      status: row.status as 'active' | 'blocked',
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }
}

export const authService = new AuthService();
