import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Task validators
//
// We have two schemas here — one for creating tasks and one for updating them.
// The key difference: on UPDATE, all fields are optional (you might only want
// to mark a task complete without re-sending the title).
// Zod's .partial() on the create schema gives us the update schema for free.
// ─────────────────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),

  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 date string' })
    .optional()
    .nullable(),

  priority: z
    .enum(['low', 'medium', 'high'], {
      errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
    })
    .optional()
    .default('medium'),

  category: z
    .string()
    .trim()
    .max(50, 'Category cannot exceed 50 characters')
    .optional()
    .default('general'),

  completed: z.boolean().optional().default(false),

  reminder: z
    .object({
      enabled: z.boolean().optional().default(false),
      remindAt: z
        .string()
        .datetime({ message: 'Reminder time must be a valid ISO 8601 date string' })
        .optional()
        .nullable(),
    })
    .optional()
    .default({}),

  aiGenerated: z.boolean().optional().default(false),
});

// For updates — every field becomes optional.
// We use .partial() so we don't have to repeat the whole schema.
// This is a clean Zod pattern worth explaining in the interview.
export const updateTaskSchema = createTaskSchema.partial();

// Schema for validating query parameters on GET /tasks
export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().trim().optional(),
  completed: z
    .string()
    .transform((val) => val === 'true') // query params arrive as strings
    .optional(),
  sortBy: z
    .enum(['dueDate', 'priority', 'createdAt', 'title'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('20'),
});
