import { query } from '../config/database.js';

export class ScanRepository {
  static async createScan({
    user_id,
    image_url,
    original_filename,
    file_size_bytes,
    mime_type,
    parent_scan_id = null,
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO scans (
        user_id, image_url, original_filename, file_size_bytes, mime_type, parent_scan_id, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'uploaded')
       RETURNING *`,
      [user_id, image_url, original_filename, file_size_bytes, mime_type, parent_scan_id]
    );
    return res.rows[0];
  }

  static async updateInitialAssessment(id, {
    crop_name,
    crop_variety,
    crop_confidence,
    initial_condition,
    initial_confidence,
    initial_notes,
    status = 'analyzed_initial',
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `UPDATE scans SET
        crop_name = $1,
        crop_variety = $2,
        crop_confidence = $3,
        initial_condition = $4,
        initial_confidence = $5,
        initial_notes = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [crop_name, crop_variety, crop_confidence, initial_condition, initial_confidence, initial_notes, status, id]
    );
    return res.rows[0];
  }

  static async updateFinalAssessment(id, {
    final_condition,
    final_confidence,
    concern_level,
    assessment_summary,
    status = 'completed',
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `UPDATE scans SET
        final_condition = $1,
        final_confidence = $2,
        concern_level = $3,
        assessment_summary = $4,
        status = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [final_condition, final_confidence, concern_level, assessment_summary, status, id]
    );
    return res.rows[0];
  }

  static async updateStatus(id, status, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `UPDATE scans SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  }

  static async findById(id) {
    const res = await query(`SELECT * FROM scans WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  static async findByIdAndUser(id, user_id) {
    const res = await query(`SELECT * FROM scans WHERE id = $1 AND user_id = $2`, [id, user_id]);
    return res.rows[0] || null;
  }

  static async listByUser(user_id, { crop = null, limit = 50, offset = 0 } = {}) {
    let sql = `SELECT * FROM scans WHERE user_id = $1`;
    const params = [user_id];

    if (crop) {
      params.push(crop);
      sql += ` AND LOWER(crop_name) = LOWER($${params.length})`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  }
}

