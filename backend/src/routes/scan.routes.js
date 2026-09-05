import { Router } from 'express';
import { ScanController } from '../controllers/scan.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { handleUploadMiddleware } from '../middleware/upload.middleware.js';

const router = Router();

// List user scan history (Requires authentication - only authenticated user's own scans)
router.get('/', authenticate, ScanController.listUserScans);

// Start crop check & upload photo (Supports both guests and authenticated users)
router.post('/upload', optionalAuthenticate, handleUploadMiddleware, ScanController.uploadAndCreateScan);

// Trigger AI validation, diagnosis, and action plan synthesis (Supports both guests and authenticated users)
router.post('/:id/analyze', optionalAuthenticate, ScanController.analyzeScan);

// Get full scan details by ID (Supports guests for unassigned scans, authenticated users for own scans)
router.get('/:id', optionalAuthenticate, ScanController.getScanDetails);

// Claim a guest scan into the authenticated user's account upon login / sign up
router.post('/:id/claim', authenticate, ScanController.claimScan);

export default router;

