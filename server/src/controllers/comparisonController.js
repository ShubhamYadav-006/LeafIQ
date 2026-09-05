import { ScanRepository } from '../repositories/scanRepository.js';
import { ComparisonRepository } from '../repositories/comparisonRepository.js';
import { ComparisonEngineService } from '../services/comparisonEngineService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ComparisonController {
  static async compareScan(req, res, next) {
    try {
      const { scanId: baselineScanId } = req.params;
      const userId = req.user.id;
      const { followup_scan_id: followupScanId } = req.body;

      if (baselineScanId === followupScanId) {
        throw ApiError.badRequest('Baseline scan and follow-up scan cannot be the same record', 'INVALID_COMPARISON');
      }

      const baselineScan = await ScanRepository.findByIdAndUser(baselineScanId, userId);
      const followupScan = await ScanRepository.findByIdAndUser(followupScanId, userId);

      if (!baselineScan) {
        throw ApiError.notFound('Baseline scan record not found or access denied');
      }
      if (!followupScan) {
        throw ApiError.notFound('Follow-up scan record not found or access denied');
      }

      // Qualitative trajectory comparison
      const comparisonResult = ComparisonEngineService.compareScans(baselineScan, followupScan);

      const savedComparison = await ComparisonRepository.createComparison({
        baseline_scan_id: baselineScanId,
        followup_scan_id: followupScanId,
        trajectory: comparisonResult.trajectory,
        comparison_summary: comparisonResult.comparison_summary,
      });

      return sendSuccess(
        res,
        {
          comparison: savedComparison,
          baseline_scan: {
            id: baselineScan.id,
            crop: baselineScan.crop_name,
            condition: baselineScan.final_condition || baselineScan.initial_condition,
            concern_level: baselineScan.concern_level,
            created_at: baselineScan.created_at,
          },
          followup_scan: {
            id: followupScan.id,
            crop: followupScan.crop_name,
            condition: followupScan.final_condition || followupScan.initial_condition,
            concern_level: followupScan.concern_level,
            created_at: followupScan.created_at,
          },
        },
        201,
        'Scan comparison created successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}
