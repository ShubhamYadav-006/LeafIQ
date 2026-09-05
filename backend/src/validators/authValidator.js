import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters long' }),
  role: z.enum(['farmer', 'agronomist', 'admin']).optional().default('farmer'),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const validateRegister = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return next(ApiError.badRequest(issue.message, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};

export const validateLogin = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return next(ApiError.badRequest(issue.message, 'VALIDATION_ERROR'));
  }
  req.body = result.data;
  next();
};

