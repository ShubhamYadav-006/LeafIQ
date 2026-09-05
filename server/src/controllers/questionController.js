import { ScanRepository } from '../repositories/scanRepository.js';
import { QuestionRepository } from '../repositories/questionRepository.js';
import { AnswerRepository } from '../repositories/answerRepository.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class QuestionController {
  static async getQuestionsForScan(req, res, next) {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const scan = await ScanRepository.findByIdAndUser(scanId, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const questions = await QuestionRepository.listByScanId(scanId);
      return sendSuccess(res, { questions });
    } catch (err) {
      next(err);
    }
  }

  static async submitAnswersForScan(req, res, next) {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;
      const { answers } = req.body;

      const scan = await ScanRepository.findByIdAndUser(scanId, userId);
      if (!scan) {
        throw ApiError.notFound('Scan record not found or access denied');
      }

      const existingQuestions = await QuestionRepository.listByScanId(scanId);
      const validQuestionIds = new Set(existingQuestions.map((q) => q.id));

      const answerPayloads = [];
      for (const ans of answers) {
        if (!validQuestionIds.has(ans.question_id)) {
          throw ApiError.badRequest(`Question ID '${ans.question_id}' does not belong to this scan`, 'INVALID_QUESTION');
        }
        answerPayloads.push({
          scan_id: scanId,
          question_id: ans.question_id,
          selected_options: ans.selected_options || [],
          answer_text: ans.answer_text || null,
        });
      }

      const savedAnswers = await AnswerRepository.createBatch(answerPayloads);
      return sendSuccess(res, { answers: savedAnswers }, 201, 'Farmer answers recorded successfully');
    } catch (err) {
      next(err);
    }
  }
}
