import { query } from '../config/database.js';

export class EvidenceRepository {
  static async createEvidence({ scan_id, source, title, description, severity }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO evidence (scan_id, source, title, description, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [scan_id, source, title, description, severity]
    );
    return res.rows[0];
  }

  static async createBatch(evidenceItems, client = null) {
    const results = [];
    for (const item of evidenceItems) {
      const res = await this.createEvidence(item, client);
      results.push(res);
    }
    return results;
  }

  static async listByScanId(scan_id) {
    const res = await query(
      `SELECT * FROM evidence WHERE scan_id = $1 ORDER BY created_at ASC`,
      [scan_id]
    );
    return res.rows;
  }
}

