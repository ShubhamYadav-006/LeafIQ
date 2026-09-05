export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST', details = null) {
    return new ApiError(400, code, message, details);
  }

  static unauthorized(message = 'Unauthorized access', code = 'UNAUTHORIZED') {
    return new ApiError(401, code, message);
  }

  static forbidden(message = 'Access forbidden', code = 'FORBIDDEN') {
    return new ApiError(403, code, message);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static unprocessable(message, code = 'UNPROCESSABLE_ENTITY', details = null) {
    return new ApiError(422, code, message, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}
