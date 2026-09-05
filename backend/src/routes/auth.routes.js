import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

export default router;

