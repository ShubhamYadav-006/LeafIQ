import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/:scanId/finalize', AssessmentController.finalizeAssessment);

export default router;
