import path from 'path';
import { getClient } from '../config/db.js';
import { ScanRepository } from '../repositories/scanRepository.js';
import { EvidenceRepository } from '../repositories/evidenceRepository.js';
import { QuestionRepository } from '../repositories/questionRepository.js';
import { AnswerRepository } from '../repositories/answerRepository.js';
import { ActionPlanRepository } from '../repositories/actionPlanRepository.js';
import { AlternativePossibilitiesRepository } from '../repositories/alternativePossibilitiesRepository.js';
import { ComparisonRepository } from '../repositories/comparisonRepository.js';
import { AiBridgeService } from '../services/aiBridgeService.js';
import { QuestionEngineService } from '../services/questionEngineService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ScanController {
  static async uploadAndCreateScan(req, res, next) {
    try {
      const file = req.file;
      const userId = req.user.id;
      const { parent_scan_id } = req.body;

      if (parent_scan_id) {
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
      const userId = req.user.id;

      const scan = await ScanRepository.findByIdAndUser(id, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const filename = path.basename(scan.image_url);
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const absoluteImagePath = path.isAbsolute(uploadDir)
        ? path.join(uploadDir, filename)
        : path.join(process.cwd(), uploadDir, filename);

      // Run AI Inference Engine (Validation + Classification)
      const aiResult = await AiBridgeService.analyzeImage(absoluteImagePath);

      if (!aiResult.image_valid || aiResult.status === 'rejected') {
        await client.query('BEGIN');
        await ScanRepository.updateStatus(id, 'failed', client);
        await client.query('COMMIT');

        return res.status(422).json({
          success: false,
          error: {
            code: 'IMAGE_VALIDATION_FAILED',
            message: aiResult.reason || aiResult.message || 'The image could not be validated as a clear crop leaf.',
            metrics: aiResult.validation?.metrics || {},
          },
        });
      }

      await client.query('BEGIN');

      // Update Initial Assessment
      const cropName = aiResult.crop?.name || 'Unknown Crop';
      const initialCondition = aiResult.assessment?.condition || 'Inconclusive Symptoms';
      const initialConfidence = aiResult.assessment?.confidence || 0.50;
      const concernLevel = aiResult.assessment?.concern_level || 'attention';

      const updatedScan = await ScanRepository.updateInitialAssessment(
        id,
        {
          crop_name: cropName,
          crop_variety: null,
          crop_confidence: aiResult.crop?.confidence || 0.90,
          initial_condition: initialCondition,
          initial_confidence: initialConfidence,
          initial_notes: `Detected visual signs resembling ${initialCondition}`,
          status: 'questions_pending',
        },
        client
      );

      // Save Visual Evidence (source = 'visual')
      const visualEvidenceItems = [
        {
          scan_id: id,
          source: 'visual',
          title: `Visual patterns matching ${initialCondition}`,
          description: `Extracted features show visual similarity to ${initialCondition} (${(initialConfidence * 100).toFixed(1)}% model match).`,
          severity: concernLevel,
        },
      ];
      await EvidenceRepository.createBatch(visualEvidenceItems, client);

      // Save Alternative Possibilities if present
      if (aiResult.alternatives && aiResult.alternatives.length > 0) {
        const altItems = aiResult.alternatives.map((alt) => ({
          scan_id: id,
          condition_name: alt.condition,
          confidence: alt.confidence,
          rationale: alt.rationale,
        }));
        await AlternativePossibilitiesRepository.createBatch(altItems, client);
      }

      // Generate & Save Smart Questions
      const questionsData = QuestionEngineService.generateQuestions(id, cropName, initialCondition);
      const generatedQuestions = await QuestionRepository.createBatch(questionsData, client);

      await client.query('COMMIT');

      return sendSuccess(
        res,
        {
          scan: updatedScan,
          initial_assessment: {
            crop: cropName,
            condition: initialCondition,
            confidence: initialConfidence,
            concern_level: concernLevel,
            confidence_tier: aiResult.assessment?.confidence_tier || 'moderate',
          },
          questions: generatedQuestions,
          alternatives: aiResult.alternatives || [],
        },
        200,
        'Initial AI visual analysis complete'
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
      const userId = req.user.id;

      const scan = await ScanRepository.findByIdAndUser(id, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const evidence = await EvidenceRepository.listByScanId(id);
      const questions = await QuestionRepository.listByScanId(id);
      const answers = await AnswerRepository.listByScanId(id);
      const alternatives = await AlternativePossibilitiesRepository.listByScanId(id);
      const actionPlan = await ActionPlanRepository.findByScanId(id);
      const comparisons = await ComparisonRepository.findByScanId(id);

      return sendSuccess(res, {
        scan,
        evidence: {
          visual: evidence.filter((e) => e.source === 'visual'),
          farmer_reported: evidence.filter((e) => e.source === 'farmer_reported'),
        },
        questions,
        answers,
        alternatives,
        action_plan: actionPlan,
        comparisons,
      });
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
