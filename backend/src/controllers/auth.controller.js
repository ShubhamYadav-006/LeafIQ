import { UserRepository } from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, full_name, role } = req.body;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw ApiError.badRequest('An account with this email address already exists.', 'EMAIL_EXISTS');
      }

      const password_hash = await hashPassword(password);
      const newUser = await UserRepository.createUser({
        email,
        password_hash,
        full_name,
        role,
      });

      const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

      return sendSuccess(
        res,
        {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            role: newUser.role,
            created_at: newUser.created_at,
          },
          token,
        },
        201,
        'User account registered successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        throw ApiError.unauthorized('Invalid email address or password', 'INVALID_CREDENTIALS');
      }

      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email address or password', 'INVALID_CREDENTIALS');
      }

      const token = generateToken({ id: user.id, email: user.email, role: user.role });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            created_at: user.created_at,
          },
          token,
        },
        200,
        'Authenticated successfully'
      );
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      return sendSuccess(res, { user: req.user });
    } catch (err) {
      next(err);
    }
  }
}

