import { Router } from 'express';
import { ScanController } from '../controllers/scan.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { handleUploadMiddleware } from '../middleware/upload.middleware.js';

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

