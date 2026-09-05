import { query } from '../config/db.js';

export class QuestionRepository {
  static async createQuestion({
    scan_id,
    question_text,
    question_type = 'single_choice',
    options = [],
    order_index = 1,
    is_required = true,
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO smart_questions (
        scan_id, question_text, question_type, options, order_index, is_required
       )
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING *`,
      [scan_id, question_text, question_type, JSON.stringify(options), order_index, is_required]
    );
    return res.rows[0];
  }

  static async createBatch(questions, client = null) {
    const results = [];
    for (const q of questions) {
      const res = await this.createQuestion(q, client);
      results.push(res);
    }
    return results;
  }

  static async listByScanId(scan_id) {
    const res = await query(
      `SELECT * FROM smart_questions WHERE scan_id = $1 ORDER BY order_index ASC`,
      [scan_id]
    );
    return res.rows;
  }

  static async findById(id) {
    const res = await query(`SELECT * FROM smart_questions WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }
}
