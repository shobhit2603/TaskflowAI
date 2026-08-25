/**
 * asyncHandler — eliminates repetitive try/catch in every route handler.
 *
 * Wraps an async Express handler function and forwards any thrown error
 * to Express's next() so the global error middleware can handle it uniformly.
 *
 * Usage:
 *   router.post('/signup', asyncHandler(authController.signup));
 *
 * @param {Function} fn - An async Express route handler (req, res, next)
 * @returns {Function}  - Express-compatible middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
