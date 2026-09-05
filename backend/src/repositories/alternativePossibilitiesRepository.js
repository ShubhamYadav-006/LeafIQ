import { query } from '../config/database.js';

export class AlternativePossibilitiesRepository {
  static async create({ scan_id, condition_name, confidence, rationale }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO alternative_possibilities (scan_id, condition_name, confidence, rationale)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [scan_id, condition_name, confidence, rationale]
    );
    return res.rows[0];
  }

  static async createBatch(items, client = null) {
    const results = [];
    for (const item of items) {
      const res = await this.create(item, client);
      results.push(res);
    }
    return results;
  }

  static async listByScanId(scan_id) {
    const res = await query(
      `SELECT * FROM alternative_possibilities WHERE scan_id = $1 ORDER BY confidence DESC`,
      [scan_id]
    );
    return res.rows;
  }
}

