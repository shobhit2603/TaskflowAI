import { z } from 'zod';
import * as AuthService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

// ─── Zod validation schemas ───────────────────────────────────────────────────
// Defined at module scope (not inside handler functions) so they're compiled
// once and reused across requests — a small but real performance win.

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters') // bcrypt 72-byte limit
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ─── Helper: parse Zod errors into a flat array ───────────────────────────────
/**
 * Converts Zod's ZodError.issues into the app's standard errors[] array format:
 * [{ field: 'email', message: 'Invalid email address' }, ...]
 *
 * @param {import('zod').ZodError} zodError
 * @returns {Array<{ field: string, message: string }>}
 */
const formatZodErrors = (zodError) =>
  zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * signup — POST /api/v1/auth/signup
 *
 * Validates input → delegates to AuthService.signup → responds 201 with
 * { success, message, data: { user, token } }
 *
 * @type {import('express').RequestHandler}
 */
export const signup = asyncHandler(async (req, res) => {
  // Validate request body
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', formatZodErrors(result.error));
  }

  const { user, token } = await AuthService.signup(result.data);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, token },
  });
});

/**
 * login — POST /api/v1/auth/login
 *
 * Validates input → delegates to AuthService.login → responds 200 with
 * { success, message, data: { user, token } }
 *
 * @type {import('express').RequestHandler}
 */
export const login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', formatZodErrors(result.error));
  }

  const { user, token } = await AuthService.login(result.data);

  return res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, token },
  });
});

/**
 * getMe — GET /api/v1/auth/me
 *
 * Protected route — req.user is guaranteed to be set by the protect middleware.
 * Returns the current authenticated user's profile.
 *
 * @type {import('express').RequestHandler}
 */
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already the full user document attached by protect middleware.
  // We call the service to get a fresh DB copy (in case of concurrent updates).
  const user = await AuthService.getMe(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'User profile fetched successfully.',
    data: { user },
  });
});
