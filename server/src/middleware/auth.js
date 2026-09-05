import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Verify user exists in database
    const userRes = await query('SELECT id, email, full_name, role FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rowCount === 0) {
      throw ApiError.unauthorized('User associated with token no longer exists');
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired authentication token'));
    }
    next(err);
  }
};
