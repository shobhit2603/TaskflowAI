import { z } from 'zod';
import { ApiError } from './apiError.js';

/**
 * validate — runs a Zod schema against data and returns the parsed result.
 *
 * On failure, throws an ApiError(400) with all field-level errors in the
 * standard { field, message } shape. This is the single place in the app
 * where Zod errors are converted to ApiErrors — keeping that logic out of
 * every controller.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {unknown} data - req.body or req.query
 * @returns {object} Parsed and coerced data (e.g. email is lowercased, "true" → true)
 */
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }
  return result.data;
};

/**
 * isValidObjectId — checks whether a string is a valid MongoDB ObjectId.
 *
 * Mongoose's findById() throws a CastError if given an invalid ObjectId format.
 * Catching that error in the global handler works, but it's cleaner to reject
 * it before hitting the database at all.
 *
 * Usage in controllers:
 *   if (!isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid task ID.');
 *
 * @param {string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);
