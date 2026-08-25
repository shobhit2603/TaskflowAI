import * as AuthService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';

// ─── Shared validation helper ─────────────────────────────────────────────────
// This tiny function is used in every controller: run the Zod schema,
// and if it fails, throw an ApiError(400) with all the field-level errors.
//
// Why not use a middleware? A middleware runs before the controller and
// needs to know which schema to use — that coupling is messier than just
// calling this one line inside the controller where context is clear.
const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }
  return result.data; // returns the parsed & coerced data (e.g. email lowercased)
};

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
 * req.user is guaranteed to be set by the protect middleware before this runs.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'User profile fetched successfully.',
    data: { user },
  });
});
