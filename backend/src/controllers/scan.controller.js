import path from 'path';
import { getClient } from '../config/database.js';
import { ScanRepository } from '../repositories/scanRepository.js';
import { EvidenceRepository } from '../repositories/evidenceRepository.js';
import { ActionPlanRepository } from '../repositories/actionPlanRepository.js';
import { AlternativePossibilitiesRepository } from '../repositories/alternativePossibilitiesRepository.js';
import { ComparisonRepository } from '../repositories/comparisonRepository.js';
import { AiBridgeService } from '../services/ai.service.js';
import { AssessmentSynthesisService } from '../services/assessment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ScanController {
  static async uploadAndCreateScan(req, res, next) {
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

      const imageUrl = `/uploads/${file.filename}`;
      const newScan = await ScanRepository.createScan({
        user_id: userId,
        image_url: imageUrl,
        original_filename: file.originalname,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        parent_scan_id: parent_scan_id || null,
      });

      return sendSuccess(res, { scan: newScan }, 201, 'Leaf photo uploaded successfully');
    } catch (err) {
      next(err);
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

      const filename = path.basename(scan.image_url);
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const absoluteImagePath = path.isAbsolute(uploadDir)
        ? path.join(uploadDir, filename)
        : path.join(process.cwd(), uploadDir, filename);

      // Run AI Inference (Gemini Vision or Local Engine)
      const aiResult = await AiBridgeService.analyzeImage(absoluteImagePath);

      if (!aiResult.image_valid || aiResult.status === 'rejected') {
        await client.query('BEGIN');
        await ScanRepository.updateStatus(id, 'failed', client);
        await client.query('COMMIT');

        return res.status(422).json({
          success: false,
          error: {
            code: 'IMAGE_VALIDATION_FAILED',
            message: aiResult.reason || aiResult.message || 'The image could not be validated as a clear crop leaf. Please upload a clearer, well-lit leaf photo.',
            metrics: aiResult.validation?.metrics || {},
          },
        });
      }

      await client.query('BEGIN');

      const cropName = aiResult.crop?.name || 'Crop';
      const condition = aiResult.assessment?.condition || 'Unknown Condition';
      const confidence = Number(aiResult.assessment?.confidence || 0.90);
      const concernLevel = aiResult.assessment?.concern_level || (condition.toLowerCase().includes('healthy') ? 'healthy' : 'attention');

      // Generate or enrich agronomist action plan
      const basePlan = AssessmentSynthesisService.generateActionPlanForCondition(cropName, condition, concernLevel);

      const immediateActions = (aiResult.assessment?.how_to_fix && aiResult.assessment.how_to_fix.length > 0)
        ? aiResult.assessment.how_to_fix
        : basePlan.immediate_actions;

      const preventionSteps = (aiResult.assessment?.prevention && aiResult.assessment.prevention.length > 0)
        ? aiResult.assessment.prevention
        : basePlan.prevention_steps;

      const monitoringSteps = (aiResult.assessment?.what_to_monitor && aiResult.assessment.what_to_monitor.length > 0)
        ? aiResult.assessment.what_to_monitor
        : basePlan.monitoring_steps;

      const whatWeFound = aiResult.assessment?.what_we_found || basePlan.visible_symptoms;
      const summaryText = `Visual analysis confirms ${condition} on ${cropName} (${(confidence * 100).toFixed(0)}% confidence). ${whatWeFound}`;

      // Update Scan to completed
      const updatedScan = await ScanRepository.updateAssessmentComplete(
        id,
        {
          crop_name: cropName,
          crop_variety: null,
          crop_confidence: Number(aiResult.crop?.confidence || 0.95),
          condition: condition,
          confidence: confidence,
          concern_level: concernLevel,
          assessment_summary: summaryText,
          status: 'completed',
        },
        client
      );

      // Save Visual Evidence
      let visualEvidenceItems = [];
      if (aiResult.assessment?.visual_evidence && Array.isArray(aiResult.assessment.visual_evidence) && aiResult.assessment.visual_evidence.length > 0) {
        visualEvidenceItems = aiResult.assessment.visual_evidence.map((ve) => ({
          scan_id: id,
          source: 'visual',
          title: ve.title || `Visual sign of ${condition}`,
          description: ve.description || whatWeFound,
          severity: ve.severity || concernLevel,
        }));
      } else {
        visualEvidenceItems = [
          {
            scan_id: id,
            source: 'visual',
            title: `Visual cues matching ${condition}`,
            description: whatWeFound,
            severity: concernLevel,
          },
        ];
      }
      await EvidenceRepository.createBatch(visualEvidenceItems, client);

      // Save Alternative Possibilities
      if (aiResult.alternatives && aiResult.alternatives.length > 0) {
        const altItems = aiResult.alternatives.map((alt) => ({
          scan_id: id,
          condition_name: alt.condition,
          confidence: alt.confidence,
          rationale: alt.rationale || `Secondary visual similarity (${(alt.confidence * 100).toFixed(0)}% match).`,
        }));
        await AlternativePossibilitiesRepository.createBatch(altItems, client);
      }

      // Save Action Plan
      const savedActionPlan = await ActionPlanRepository.createActionPlan(
        {
          scan_id: id,
          immediate_actions: immediateActions,
          monitoring_steps: monitoringSteps,
          prevention_steps: preventionSteps,
          when_to_seek_expert: basePlan.when_to_seek_expert,
          disclaimer: aiResult.assessment?.disclaimer || basePlan.disclaimer,
        },
        client
      );

      await client.query('COMMIT');

      return sendSuccess(
        res,
        {
          scan: updatedScan,
          assessment: {
            crop: cropName,
            condition: condition,
            confidence: confidence,
            concern_level: concernLevel,
            what_we_found: whatWeFound,
            summary: summaryText,
          },
          evidence: visualEvidenceItems,
          action_plan: savedActionPlan,
          alternatives: aiResult.alternatives || [],
        },
        200,
        'Crop AI diagnosis and action plan generated successfully'
      );
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      next(err);
    } finally {
      client.release();
    }
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


