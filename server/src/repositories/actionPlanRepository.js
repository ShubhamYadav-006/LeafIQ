import { query } from '../config/db.js';

export class ActionPlanRepository {
  static async createActionPlan({
    scan_id,
    immediate_actions = [],
    monitoring_steps = [],
    prevention_steps = [],
    when_to_seek_expert = null,
    disclaimer = 'LeafIQ provides an AI-assisted crop health assessment and should not be treated as a confirmed diagnosis.',
  }, client = null) {
    const q = client ? client.query.bind(client) : query;
    const res = await q(
      `INSERT INTO action_plans (
        scan_id, immediate_actions, monitoring_steps, prevention_steps, when_to_seek_expert, disclaimer
       )
       VALUES ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6)
       ON CONFLICT (scan_id)
       DO UPDATE SET
        immediate_actions = EXCLUDED.immediate_actions,
        monitoring_steps = EXCLUDED.monitoring_steps,
        prevention_steps = EXCLUDED.prevention_steps,
        when_to_seek_expert = EXCLUDED.when_to_seek_expert,
        disclaimer = EXCLUDED.disclaimer,
        created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        scan_id,
        JSON.stringify(immediate_actions),
        JSON.stringify(monitoring_steps),
        JSON.stringify(prevention_steps),
        when_to_seek_expert,
        disclaimer,
      ]
    );
    return res.rows[0];
  }

  static async findByScanId(scan_id) {
    const res = await query(`SELECT * FROM action_plans WHERE scan_id = $1`, [scan_id]);
    return res.rows[0] || null;
  }
}
