import { verifyToken } from '../utils/jwt.js';
import * as UserRepository from '../repositories/user.repository.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * protect — JWT authentication guard middleware.
 *
 * Guards any route that requires an authenticated user. On success,
 * attaches the full user document to req.user so downstream handlers
 * don't need to re-fetch it.
 *
 * Flow:
 *   1. Extract token from "Authorization: Bearer <token>" header
 *   2. Verify + decode the token via verifyToken() (throws ApiError on failure)
 *   3. Fetch the user from DB to confirm they still exist
 *   4. Attach user to req.user and call next()
 *
 * Why re-fetch from DB instead of trusting the JWT payload alone?
 *   — JWT payloads are signed but not encrypted. If a user is deleted or
 *     their account is suspended between token issuance and this request,
 *     the DB fetch will return null and we reject the request cleanly.
 *   — We only store {id, email} in the JWT; the full user document (name,
 *     timestamps, etc.) needs to come from DB anyway.
 *
 * @type {import('express').RequestHandler}
 */
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract the Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized(
      'No authentication token provided. Please log in.'
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw ApiError.unauthorized('Malformed authorization header.');
  }

  // 2. Verify token — throws ApiError(401) if expired or tampered
  const decoded = verifyToken(token);

  // 3. Confirm the user still exists in the database
  const user = await UserRepository.findById(decoded.id);

  if (!user) {
    throw ApiError.unauthorized(
      'The user belonging to this token no longer exists.'
    );
  }

  // 4. Attach user to request for downstream handlers
  req.user = user;

  next();
});
