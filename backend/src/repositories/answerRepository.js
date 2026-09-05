import { query } from '../config/database.js';

export class AnswerRepository {
  static async upsertAnswer({
    scan_id,
    question_id,
    selected_options = [],
    answer_text = null,
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO answers (scan_id, question_id, selected_options, answer_text)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (scan_id, question_id)
       DO UPDATE SET
        selected_options = EXCLUDED.selected_options,
        answer_text = EXCLUDED.answer_text,
        created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [scan_id, question_id, JSON.stringify(selected_options), answer_text]
    );
    return res.rows[0];
  }

  static async createBatch(answers, client = null) {
    const results = [];
    for (const ans of answers) {
      const res = await this.upsertAnswer(ans, client);
      results.push(res);
    }
    return results;
  }

  static async listByScanId(scan_id) {
    const res = await query(
      `SELECT a.*, q.question_text, q.question_type
       FROM answers a
       JOIN smart_questions q ON a.question_id = q.id
       WHERE a.scan_id = $1
       ORDER BY q.order_index ASC`,
      [scan_id]
    );
    return res.rows;
  }
}

