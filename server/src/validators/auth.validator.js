import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Why a separate validators folder?
//
// Keeping Zod schemas outside the controller has two benefits:
//   1. The controller stays focused on one thing: handling HTTP (read input,
//      call service, send response). It shouldn't also define validation rules.
//   2. Schemas become reusable — if a second controller or a test needs the
//      same shape, it imports from here instead of duplicating.
//
// Think of validators as the "contract" for what the API accepts.
// ─────────────────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
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
    .max(72, 'Password cannot exceed 72 characters') // bcrypt silently truncates above 72 bytes
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});
