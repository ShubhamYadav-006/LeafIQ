import { Router } from 'express';
import { ScanController } from '../controllers/scanController.js';
import { authenticate } from '../middleware/auth.js';
import { handleUploadMiddleware } from '../middleware/upload.js';

const router = Router();

// Protect all scan routes
router.use(authenticate);

// List user scan history
router.get('/', ScanController.listUserScans);

// Start crop check & upload photo
router.post('/upload', handleUploadMiddleware, ScanController.uploadAndCreateScan);

// Trigger AI validation & initial visual analysis
router.post('/:id/analyze', ScanController.analyzeScan);

// Get full scan details by ID
router.get('/:id', ScanController.getScanDetails);

export default router;
