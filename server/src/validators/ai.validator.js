import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// AI Validators
//
// Two types of schemas live here:
//   1. INPUT schemas  — what the controller validates from req.body (same Zod
//      pattern used everywhere else in the project)
//   2. OUTPUT schemas — what we pass to .withStructuredOutput() to enforce the
//      shape of what Mistral returns. The .describe() calls on each field act
//      as inline prompt hints — they're included in the tool definition that
//      LangChain sends to the model, helping it understand what to extract.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Input Schemas (req.body validation) ─────────────────────────────────────

export const parseTaskInputSchema = z.object({
  text: z
    .string({ required_error: 'Text is required' })
    .trim()
    .min(3, 'Please provide at least 3 characters')
    .max(500, 'Input text cannot exceed 500 characters'),
});

export const suggestCategoryInputSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z.string().trim().max(2000).optional().default(''),
});

// ─── Output Schemas (model structured output enforcement) ─────────────────────

/**
 * parseTaskOutputSchema — the shape we expect Mistral to return for task parsing.
 *
 * Each .describe() string is embedded in the tool definition LangChain sends
 * to the model. Good descriptions = better extraction accuracy.
 */
export const parseTaskOutputSchema = z.object({
  title: z
    .string()
    .describe(
      'A short, action-oriented task title extracted from the user input. ' +
        'Start with a verb. E.g. "Call vendor about invoice #223". Max 10 words.'
    ),

  description: z
    .string()
    .describe(
      'Any additional context or details from the user input that did not ' +
        'fit in the title. Empty string if nothing extra.'
    )
    .default(''),

  dueDate: z
    .string()
    .nullable()
    .describe(
      'The due date and time as an ISO 8601 UTC string (e.g. "2026-08-29T14:00:00.000Z"). ' +
        'Compute this relative to the currentDate provided in the system prompt. ' +
        '"next Friday afternoon" = next Friday at 14:00 UTC. ' +
        'Return null if no date or time was mentioned.'
    ),

  priority: z
    .enum(['low', 'medium', 'high'])
    .describe(
      'Task priority inferred from the urgency language in the input. ' +
        'Words like "urgent", "ASAP", "critical", "important" → high. ' +
        'Default to "medium" if no urgency cues are present.'
    ),

  category: z
    .string()
    .describe(
      'Best-fit category for the task. Choose from: work, personal, health, ' +
        'finance, shopping, learning, home, social. ' +
        'Use your best judgment from the task context.'
    ),
});

/**
 * suggestCategoryOutputSchema — shape for the category/priority suggestion feature.
 * Includes a `reasoning` field — shown to the user as a tooltip/chip subtitle
 * to explain why the suggestion was made, building trust in the AI output.
 */
export const suggestCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'Best-fit category: work, personal, health, finance, shopping, learning, home, social.'
    ),

  priority: z
    .enum(['low', 'medium', 'high'])
    .describe('Suggested priority based on the task context and typical urgency for this type of task.'),

  reasoning: z
    .string()
    .describe(
      'One short sentence explaining why this category and priority were chosen. ' +
        'Shown to the user as a tooltip. E.g. "Invoices are typically work tasks with medium urgency."'
    ),
});
