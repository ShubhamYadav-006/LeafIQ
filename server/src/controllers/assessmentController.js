import { getClient } from '../config/db.js';
import { ScanRepository } from '../repositories/scanRepository.js';
import { EvidenceRepository } from '../repositories/evidenceRepository.js';
import { AnswerRepository } from '../repositories/answerRepository.js';
import { ActionPlanRepository } from '../repositories/actionPlanRepository.js';
import { AssessmentSynthesisService } from '../services/assessmentSynthesisService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class AssessmentController {
  static async finalizeAssessment(req, res, next) {
    const client = await getClient();
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const scan = await ScanRepository.findByIdAndUser(scanId, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const visualEvidence = await EvidenceRepository.listByScanId(scanId);
      const farmerAnswers = await AnswerRepository.listByScanId(scanId);

      // Synthesize assessment
      const synthesis = AssessmentSynthesisService.synthesizeFinalAssessment(
        scan,
        visualEvidence.filter((e) => e.source === 'visual'),
        farmerAnswers
      );

      await client.query('BEGIN');

      // 1. Update Scan Record
      const updatedScan = await ScanRepository.updateFinalAssessment(
        scanId,
        {
          final_condition: synthesis.final_condition,
          final_confidence: synthesis.final_confidence,
          concern_level: synthesis.concern_level,
          assessment_summary: synthesis.assessment_summary,
          status: 'completed',
        },
        client
      );

      // 2. Persist Farmer-Reported Evidence (source = 'farmer_reported')
      if (synthesis.farmer_reported_cues && synthesis.farmer_reported_cues.length > 0) {
        const farmerEvidenceItems = synthesis.farmer_reported_cues.map((cue) => ({
          scan_id: scanId,
          source: 'farmer_reported',
          title: cue,
          description: `Reported by farmer during follow-up questionnaire: "${cue}"`,
          severity: synthesis.concern_level,
        }));
        await EvidenceRepository.createBatch(farmerEvidenceItems, client);
      }

      // 3. Persist Action Plan
      const savedActionPlan = await ActionPlanRepository.createActionPlan(
        {
          scan_id: scanId,
          immediate_actions: synthesis.action_plan.immediate_actions,
          monitoring_steps: synthesis.action_plan.monitoring_steps,
          prevention_steps: synthesis.action_plan.prevention_steps,
          when_to_seek_expert: synthesis.action_plan.when_to_seek_expert,
          disclaimer: synthesis.action_plan.disclaimer,
        },
        client
      );

      await client.query('COMMIT');

      const allEvidence = await EvidenceRepository.listByScanId(scanId);

      return sendSuccess(
        res,
        {
          scan: updatedScan,
          assessment: {
            condition: updatedScan.final_condition,
            confidence: updatedScan.final_confidence,
            concern_level: updatedScan.concern_level,
            summary: updatedScan.assessment_summary,
          },
          evidence: {
            visual: allEvidence.filter((e) => e.source === 'visual'),
            farmer_reported: allEvidence.filter((e) => e.source === 'farmer_reported'),
          },
          action_plan: savedActionPlan,
        },
        200,
        'Final assessment generated and committed successfully'
      );
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      next(err);
    } finally {
      client.release();
    }
  }
}
