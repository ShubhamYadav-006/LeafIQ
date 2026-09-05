import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/:scanId/finalize', AssessmentController.finalizeAssessment);

export default router;

