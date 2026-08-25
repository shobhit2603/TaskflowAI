/**
 * ApiError — a typed, operational error thrown by service/middleware layers.
 *
 * Distinguishing operational errors (ApiError) from programmer errors (unexpected
 * crashes) lets the global error handler decide what to expose to the client vs.
 * what to log as a 500 with no details.
 *
 * Usage:
 *   throw new ApiError(404, 'Task not found');
 *   throw new ApiError(400, 'Validation failed', [{ field: 'email', msg: '...' }]);
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode  - HTTP status code (e.g. 400, 401, 404, 409)
   * @param {string} message     - Human-readable error message sent to the client
   * @param {Array}  errors      - Optional array of field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    // Flag that distinguishes known operational errors from unexpected bugs.
    // The global error handler checks this to decide the response shape.
    this.isOperational = true;

    // Preserve the original stack trace (V8-specific)
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Factory helpers ──────────────────────────────────────────────────────

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
