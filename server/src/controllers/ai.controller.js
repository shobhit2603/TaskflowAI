import * as AIService from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../utils/validate.js';
import {
  parseTaskInputSchema,
  suggestCategoryInputSchema,
} from '../validators/ai.validator.js';

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/ai/parse-task
 *
 * Receives a natural-language string and returns a structured task object
 * for the frontend to pre-fill a task creation form.
 *
 * IMPORTANT: This endpoint never creates a task. It only proposes fields.
 * The user must explicitly submit the form to create the task.
 * This is a deliberate UX and safety decision: "AI proposes, user confirms."
 */
export const parseTask = asyncHandler(async (req, res) => {
  const { text } = validate(parseTaskInputSchema, req.body);

  const result = await AIService.parseTaskFromText(text);

  // The message changes based on whether AI fully succeeded or fell back.
  // This gives the frontend context to show appropriate UI (e.g. a warning
  // banner when fallback: true explaining the AI couldn't fully parse).
  const message = result.fallback
    ? 'Could not fully parse the task. Pre-filled what we could — please review the fields.'
    : 'Task parsed successfully. Please review and confirm before saving.';

  return res.status(200).json({
    success: true,
    message,
    data: result,
  });
});

/**
 * POST /api/v1/ai/suggest-category
 *
 * Receives a task title + optional description and returns a suggested
 * category and priority with a brief reasoning string.
 *
 * This is designed to run asynchronously as the user types — the suggestion
 * appears as a "chip" they can accept or ignore.
 * Even if the AI call fails, this always returns a 200 with safe defaults
 * so the UI never breaks.
 */
export const suggestCategory = asyncHandler(async (req, res) => {
  const { title, description } = validate(suggestCategoryInputSchema, req.body);

  const result = await AIService.suggestCategoryAndPriority(title, description);

  return res.status(200).json({
    success: true,
    message: result.reasoning
      ? 'Suggestion generated successfully.'
      : 'Using default suggestion.',
    data: result,
  });
});
