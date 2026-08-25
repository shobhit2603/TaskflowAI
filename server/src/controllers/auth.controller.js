import * as AuthService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../utils/validate.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/signup
 * Public — creates a new user account and returns a JWT.
 */
export const signup = asyncHandler(async (req, res) => {
  const data = validate(signupSchema, req.body);

  const { user, token } = await AuthService.signup(data);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, token },
  });
});

/**
 * POST /api/v1/auth/login
 * Public — authenticates a user and returns a JWT.
 */
export const login = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);

  const { user, token } = await AuthService.login(data);

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, token },
  });
});

/**
 * GET /api/v1/auth/me
 * Protected — returns the currently authenticated user's profile.
 *
 * The protect middleware already fetched the user from DB and attached it to
 * req.user. We return it directly here instead of doing a second DB call —
 * the data is fresh from this same request's middleware chain.
 */
export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User profile fetched successfully.',
    data: { user: req.user },
  });
});
