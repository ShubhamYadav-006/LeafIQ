import { Router } from 'express';
import { ComparisonController } from '../controllers/comparison.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateCompareScan } from '../validators/scanValidator.js';

const router = Router();

router.use(authenticate);

router.post('/:scanId/compare', validateCompareScan, ComparisonController.compareScan);

export default router;

