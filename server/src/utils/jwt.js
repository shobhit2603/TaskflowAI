import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config.js';
import { ApiError } from './apiError.js';

// Token expiry — 7 days is reasonable for this assignment scope.
// In production you'd pair a short-lived access token (~15m) with a
// refresh token, but that adds hours of complexity for no interview signal.
const JWT_EXPIRY = '7d';
const JWT_ALGORITHM = 'HS256';

/**
 * generateToken — signs a JWT containing the user's payload.
 *
 * We only embed the minimal payload (id, email) to keep tokens small.
 * Never put sensitive fields (passwordHash, etc.) in a JWT payload.
 *
 * @param {{ id: string, email: string }} payload
 * @returns {string} Signed JWT string
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRY,
  });
};

/**
 * verifyToken — verifies and decodes a JWT string.
 *
 * Throws ApiError(401) for both expired tokens and tampered signatures
 * so the auth middleware always has a typed error to forward.
 *
 * @param {string} token - Raw JWT string (without "Bearer " prefix)
 * @returns {object}     - Decoded payload { id, email, iat, exp }
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, envConfig.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please log in again.');
    }
    // Covers JsonWebTokenError (bad signature, malformed) and NotBeforeError
    throw ApiError.unauthorized('Invalid token. Please log in again.');
  }
};
