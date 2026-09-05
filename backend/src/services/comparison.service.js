export class ComparisonEngineService {
  static compareScans(baselineScan, followupScan) {
    const baseCondition = baselineScan.final_condition || baselineScan.initial_condition || 'Unknown';
    const followupCondition = followupScan.final_condition || followupScan.initial_condition || 'Unknown';

    const baseConcern = baselineScan.concern_level || 'attention';
    const followupConcern = followupScan.concern_level || 'attention';

    const concernRank = {
      healthy: 1,
      monitor: 2,
      uncertain: 3,
      attention: 4,
      high_concern: 5,
    };

    const baseRank = concernRank[baseConcern] || 3;
    const followupRank = concernRank[followupConcern] || 3;

    let trajectory = 'unclear';
    let summary = '';

    if (followupCondition.includes('Healthy') && !baseCondition.includes('Healthy')) {
      trajectory = 'improving';
      summary = `Crop health shows significant improvement. Follow-up scan indicates healthy foliage recovering from previous ${baseCondition}.`;
    } else if (followupRank < baseRank) {
      trajectory = 'improving';
      summary = `Symptoms appear to be improving. Urgency level reduced from '${baseConcern.replace('_', ' ')}' to '${followupConcern.replace('_', ' ')}'.`;
    } else if (followupRank > baseRank) {
      trajectory = 'worsening';
      summary = `Symptom severity appears to have increased since the baseline scan on ${new Date(baselineScan.created_at).toLocaleDateString()}. Urgency level increased to '${followupConcern.replace('_', ' ')}'.`;
    } else if (baseCondition === followupCondition) {
      trajectory = 'stable';
      summary = `Crop condition remains stable (${baseCondition}). No rapid spreading or severe decline observed between scans.`;
    } else {
      trajectory = 'unclear';
      summary = `Visual findings show overlapping patterns (${baseCondition} vs. ${followupCondition}). Continue regular monitoring.`;
    }

    return {
      trajectory,
      comparison_summary: summary,
    };
  }
}

