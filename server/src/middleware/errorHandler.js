import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle PostgreSQL Error Codes
  if (err.code === '23505') {
    // Unique constraint violation
    const detail = err.detail || '';
    if (detail.includes('email')) {
      return sendError(res, 409, 'EMAIL_EXISTS', 'An account with this email address already exists.');
    }
    return sendError(res, 409, 'DUPLICATE_ENTRY', 'A record with duplicate fields already exists.');
  }

  if (err.code === '23503') {
    // Foreign key violation
    return sendError(res, 400, 'FOREIGN_KEY_VIOLATION', 'Referenced resource does not exist.');
  }

  if (err.code === '22P02') {
    // Invalid text representation (e.g. malformed UUID)
    return sendError(res, 400, 'INVALID_UUID', 'Provided ID format is invalid.');
  }

  // Handle Syntax Errors in Body JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Malformed JSON payload provided.');
  }

  // Fallback 500 Internal Error
  const isDev = process.env.NODE_ENV !== 'production';
  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'An unexpected error occurred. Please try again later.',
    isDev ? err.message : null
  );
};
