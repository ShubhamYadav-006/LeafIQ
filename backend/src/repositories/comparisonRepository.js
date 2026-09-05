import { query } from '../config/database.js';

export class ComparisonRepository {
  static async createComparison({
    baseline_scan_id,
    followup_scan_id,
    trajectory = 'unclear',
    comparison_summary,
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO scan_comparisons (
        baseline_scan_id, followup_scan_id, trajectory, comparison_summary
       )
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (baseline_scan_id, followup_scan_id)
       DO UPDATE SET
        trajectory = EXCLUDED.trajectory,
        comparison_summary = EXCLUDED.comparison_summary,
        created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [baseline_scan_id, followup_scan_id, trajectory, comparison_summary]
    );
    return res.rows[0];
  }

  static async findByPair(baseline_scan_id, followup_scan_id) {
    const res = await query(
      `SELECT * FROM scan_comparisons WHERE baseline_scan_id = $1 AND followup_scan_id = $2`,
      [baseline_scan_id, followup_scan_id]
    );
    return res.rows[0] || null;
  }

  static async findByScanId(scan_id) {
    const res = await query(
      `SELECT * FROM scan_comparisons WHERE baseline_scan_id = $1 OR followup_scan_id = $1 ORDER BY created_at DESC`,
      [scan_id]
    );
    return res.rows;
  }
}

