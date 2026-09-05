import { getClient } from '../config/database.js';
import { ScanRepository } from '../repositories/scanRepository.js';
import { EvidenceRepository } from '../repositories/evidenceRepository.js';
import { ActionPlanRepository } from '../repositories/actionPlanRepository.js';
import { AlternativePossibilitiesRepository } from '../repositories/alternativePossibilitiesRepository.js';
import { ComparisonRepository } from '../repositories/comparisonRepository.js';
import { AiBridgeService } from '../services/ai.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ScanController {
  static async uploadAndCreateScan(req, res, next) {
    const client = await getClient();
    try {
      const file = req.file;
      if (!file) {
        throw ApiError.badRequest('No image file provided for upload.');
      }

      const userId = req.user ? req.user.id : null;
      const { parent_scan_id } = req.body;

      if (parent_scan_id && userId) {
        const parentScan = await ScanRepository.findByIdAndUser(parent_scan_id, userId);
        if (!parentScan) {
          throw ApiError.notFound('Parent scan for re-scan comparison not found or access denied');
        }
      }

      // Process image in memory as Data URL (100% Vercel serverless compatible, zero local disk writes)
      const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const newScan = await ScanRepository.createScan({
        user_id: userId,
        image_url: dataUrl,
        original_filename: file.originalname,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        parent_scan_id: parent_scan_id || null,
      });

      // Analyze immediately via Google Gemini multimodal AI
      const aiResult = await AiBridgeService.analyzeImage(file.buffer, file.mimetype);

      // Persist findings and format response
      const resultPayload = await ScanController._persistAndFormatResult(newScan.id, aiResult, client);

      return sendSuccess(res, resultPayload, 201, 'Crop photo analyzed with Gemini AI successfully');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
  }

  static async analyzeScan(req, res, next) {
    const client = await getClient();
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const scan = await ScanRepository.findByIdAndUser(id, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      // If already completed and has full assessment, return existing data
      if (scan.status === 'completed') {
        const evidence = await EvidenceRepository.listByScanId(id);
        const alternatives = await AlternativePossibilitiesRepository.listByScanId(id);
        const actionPlan = await ActionPlanRepository.findByScanId(id);

        return sendSuccess(res, {
          scan,
          assessment: {
            crop: scan.crop_name,
            condition: scan.final_condition,
            status: scan.final_condition?.toLowerCase().includes('healthy') ? 'healthy' : 'possible_problem',
            problem: scan.final_condition?.toLowerCase().includes('healthy') ? null : scan.final_condition,
            confidence: scan.final_confidence >= 0.85 ? 'High' : (scan.final_confidence >= 0.60 ? 'Medium' : 'Low'),
            concern_level: scan.concern_level || 'Low',
            description: scan.assessment_summary,
            what_we_found: scan.assessment_summary,
          },
          evidence: evidence.filter((e) => e.source === 'visual'),
          action_plan: actionPlan,
          alternatives,
        });
      }

      // Otherwise analyze from scan.image_url (which is a data: URL)
      const aiResult = await AiBridgeService.analyzeImage(scan.image_url, scan.mime_type);
      const resultPayload = await ScanController._persistAndFormatResult(id, aiResult, client);

      return sendSuccess(res, resultPayload, 200, 'Crop AI diagnosis completed successfully');
    } catch (err) {
      next(err);
    } finally {
      client.release();
    }
  }

  /**
   * Helper to persist Gemini results into PostgreSQL and format frontend payload.
   */
  static async _persistAndFormatResult(scanId, aiResult, client) {
    const confMap = { High: 0.95, Medium: 0.70, Low: 0.40 };

    if (!aiResult.image_valid || aiResult.assessment?.status === 'insufficient_image') {
      await client.query('BEGIN');
      const updatedScan = await ScanRepository.updateStatus(scanId, 'failed', client);
      await client.query('COMMIT');

      return {
        scan: { ...updatedScan, image_valid: false },
        image_valid: false,
        plant_detected: false,
        crop: null,
        assessment: aiResult.assessment,
        visual_evidence: [],
        description: aiResult.description,
        how_to_fix: [],
        prevention: [],
        what_to_monitor: [],
        alternative_possibilities: [],
        disclaimer: aiResult.disclaimer,
        gemini_result: aiResult,
      };
    }

    const isHealthy = aiResult.assessment?.status === 'healthy';
    const cropName = aiResult.crop?.name || 'Crop';
    const condition = isHealthy ? 'Healthy Plant' : (aiResult.assessment?.problem || 'Unspecified Condition');
    const cropConfNum = confMap[aiResult.crop?.confidence] || 0.90;
    const assessmentConfNum = confMap[aiResult.assessment?.confidence] || 0.85;

    let dbConcern = 'attention';
    const cl = (aiResult.assessment?.concern_level || '').toLowerCase();
    if (cl.includes('low') || isHealthy) dbConcern = 'healthy';
    else if (cl.includes('monitor')) dbConcern = 'monitor';
    else if (cl.includes('high') || cl.includes('severe')) dbConcern = 'high_concern';
    else if (cl.includes('unable') || cl.includes('uncertain')) dbConcern = 'uncertain';

    await client.query('BEGIN');

    // Update scan row
    const updatedScan = await ScanRepository.updateAssessmentComplete(
      scanId,
      {
        crop_name: cropName,
        crop_variety: null,
        crop_confidence: cropConfNum,
        condition: condition,
        confidence: assessmentConfNum,
        concern_level: dbConcern,
        assessment_summary: aiResult.description,
        status: 'completed',
      },
      client
    );

    // Save visual evidence
    const visualItems = (aiResult.visual_evidence && aiResult.visual_evidence.length > 0)
      ? aiResult.visual_evidence.map((ve) => ({
          scan_id: scanId,
          source: 'visual',
          title: typeof ve === 'string' ? ve : (ve.title || 'Visual indicator'),
          description: typeof ve === 'string' ? ve : (ve.description || ''),
          severity: dbConcern,
        }))
      : [
          {
            scan_id: scanId,
            source: 'visual',
            title: isHealthy ? 'Foliage intact and healthy' : `Visual signs matching ${condition}`,
            description: aiResult.description,
            severity: dbConcern,
          },
        ];

    await EvidenceRepository.createBatch(visualItems, client);

    // Save alternative possibilities
    if (aiResult.alternative_possibilities && aiResult.alternative_possibilities.length > 0) {
      const altItems = aiResult.alternative_possibilities.map((alt) => ({
        scan_id: scanId,
        condition_name: typeof alt === 'string' ? alt : (alt.problem || alt.condition || 'Alternative'),
        confidence: confMap[alt.confidence] || 0.25,
        rationale: alt.rationale || 'Shows secondary visual similarity.',
      }));
      await AlternativePossibilitiesRepository.createBatch(altItems, client);
    }

    // Save action plan
    const savedActionPlan = await ActionPlanRepository.createActionPlan(
      {
        scan_id: scanId,
        immediate_actions: aiResult.how_to_fix || [],
        monitoring_steps: aiResult.what_to_monitor || [],
        prevention_steps: aiResult.prevention || [],
        when_to_seek_expert: isHealthy
          ? 'Reach out for agronomic advice if unexpected spots, wilting, or stunting appear.'
          : 'If symptoms advance into the upper foliage within 5 days, seek professional agricultural advice.',
        disclaimer: aiResult.disclaimer || 'This is an AI-assisted visual assessment and is not a guaranteed expert diagnosis.',
      },
      client
    );

    await client.query('COMMIT');

    return {
      scan: updatedScan,
      image_valid: true,
      plant_detected: true,
      crop: aiResult.crop,
      assessment: {
        crop: cropName,
        condition: condition,
        status: aiResult.assessment.status,
        problem: aiResult.assessment.problem,
        confidence: aiResult.assessment.confidence,
        concern_level: aiResult.assessment.concern_level,
        what_we_found: aiResult.description,
        description: aiResult.description,
      },
      evidence: visualItems,
      action_plan: savedActionPlan,
      alternatives: aiResult.alternative_possibilities || [],
      gemini_result: aiResult,
    };
  }

  static async getScanDetails(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;

      const scan = await ScanRepository.findByIdAndUser(id, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const evidence = await EvidenceRepository.listByScanId(id);
      const alternatives = await AlternativePossibilitiesRepository.listByScanId(id);
      const actionPlan = await ActionPlanRepository.findByScanId(id);
      const comparisons = await ComparisonRepository.findByScanId(id);

      return sendSuccess(res, {
        scan,
        evidence: {
          visual: evidence.filter((e) => e.source === 'visual'),
          farmer_reported: evidence.filter((e) => e.source === 'farmer_reported'),
        },
        action_plan: actionPlan,
        alternatives,
        comparisons,
      });
    } catch (err) {
      next(err);
    }
  }

  static async claimScan(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const scan = await ScanRepository.claimScan(id, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or already assigned to another account');
      }

      return sendSuccess(res, { scan }, 200, 'Scan successfully saved to your account');
    } catch (err) {
      next(err);
    }
  }

  static async listUserScans(req, res, next) {
    try {
      const userId = req.user.id;
      const { crop, limit = 50, offset = 0 } = req.query;

      const scans = await ScanRepository.listByUser(userId, {
        crop,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      return sendSuccess(res, { scans, count: scans.length });
    } catch (err) {
      next(err);
    }
  }
}


