import { query } from '../config/db.js';

export class UserRepository {
  static async createUser({ email, password_hash, full_name, role = 'farmer' }) {
    const res = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at, updated_at`,
      [email.toLowerCase(), password_hash, full_name, role]
    );
    return res.rows[0];
  }

  static async findByEmail(email) {
    const res = await query(
      `SELECT id, email, password_hash, full_name, role, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    return res.rows[0] || null;
  }

  static async findById(id) {
    const res = await query(
      `SELECT id, email, full_name, role, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }
}
