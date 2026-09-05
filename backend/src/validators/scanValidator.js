import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';

const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().uuid({ message: 'Invalid question ID format' }),
      selected_options: z.array(z.string()).default([]),
      answer_text: z.string().optional(),
    })
  ).min(1, { message: 'At least one answer must be provided' }),
});

const compareScanSchema = z.object({
  followup_scan_id: z.string().uuid({ message: 'Invalid follow-up scan ID format' }),
});

export const validateSubmitAnswers = (req, res, next) => {
  const result = submitAnswersSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return next(ApiError.badRequest(issue.message, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};

export const validateCompareScan = (req, res, next) => {
  const result = compareScanSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return next(ApiError.badRequest(issue.message, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};

