import { Router } from 'express';
import { QuestionController } from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';
import { validateSubmitAnswers } from '../validators/scanValidator.js';

const router = Router();

router.use(authenticate);

router.get('/:scanId/questions', QuestionController.getQuestionsForScan);
router.post('/:scanId/answers', validateSubmitAnswers, QuestionController.submitAnswersForScan);

export default router;
