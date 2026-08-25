import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import getMistralModel from '../config/ai.config.js';
import {
  parseTaskOutputSchema,
  suggestCategoryOutputSchema,
} from '../validators/ai.validator.js';

// ─────────────────────────────────────────────────────────────────────────────
// AIService — all LangChain / Mistral calls live here.
//
// The pattern for each function:
//   1. Build a clear system prompt (what the model "is" and what context it has)
//   2. Call model.withStructuredOutput(schema).invoke([systemMsg, humanMsg])
//   3. On success → return the parsed result
//   4. On any error → catch it, log it, return a safe fallback
//      (never crash the user's flow because an AI call failed)
//
// Why catch ALL errors here instead of letting them bubble to the global handler?
// AI calls failing should be a graceful degradation, not a 500 error. The user
// typed something — they should still get something back, even if it's partial.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseTaskFromText — the flagship AI feature.
 *
 * Takes a natural-language string and extracts structured task fields.
 * Uses .withStructuredOutput() so Mistral returns a typed object, not a string
 * we'd have to parse ourselves (which breaks when the model adds markdown fences
 * or prose around the JSON).
 *
 * @param {string} text - The user's natural language input
 * @returns {Promise<{ parsed: object, fallback: boolean, originalText: string }>}
 */
export const parseTaskFromText = async (text) => {
  try {
    const model = getMistralModel({ temperature: 0.1 }); // low temp = deterministic extraction

    // Bind the output schema — LangChain passes this to Mistral's tool-calling
    // mode so the response is guaranteed to match our Zod schema shape.
    const structuredModel = model.withStructuredOutput(parseTaskOutputSchema, {
      name: 'extract_task', // tool name shown to the model
    });

    // The system prompt sets context and gives the model what it needs to
    // resolve relative dates ("next Friday" → an actual date).
    const systemPrompt = new SystemMessage(
      `You are a task extraction assistant for a productivity app called TaskflowAI.
Your job is to extract structured task information from natural language input.

Today's date and time (UTC): ${new Date().toISOString()}
User's timezone hint: The user likely means their local timezone, but output all dates in UTC ISO 8601 format.

Rules:
- Extract the task title as a short, action-oriented phrase (start with a verb).
- Infer due dates relative to today's date above. "Next Friday" = the coming Friday.
- "Afternoon" = 14:00 UTC, "morning" = 09:00 UTC, "evening" = 18:00 UTC.
- If no date is mentioned, return null for dueDate.
- Infer priority from urgency language (urgent/ASAP/critical = high, otherwise medium or low).
- Choose the most appropriate category from: work, personal, health, finance, shopping, learning, home, social.
- Keep descriptions concise — only include details not captured in the title.`
    );

    const humanMessage = new HumanMessage(text);

    const parsed = await structuredModel.invoke([systemPrompt, humanMessage]);

    return {
      parsed,
      fallback: false,
      originalText: text,
    };
  } catch (error) {
    // Log the error server-side for debugging, but don't crash the request.
    console.error('[AIService] parseTaskFromText failed:', error.message);

    // Fallback: return the raw text as the title with safe defaults.
    // The frontend will pre-fill the form with this — better than nothing.
    return {
      parsed: {
        title: text.length > 100 ? text.slice(0, 100) + '...' : text,
        description: '',
        dueDate: null,
        priority: 'medium',
        category: 'general',
      },
      fallback: true,
      originalText: text,
    };
  }
};

/**
 * suggestCategoryAndPriority — the secondary AI feature.
 *
 * Given a task title (and optional description), suggests a category and
 * priority with a one-sentence reasoning string shown to the user.
 * This runs as an async call while the user is still typing — they can
 * accept or ignore the suggestion.
 *
 * @param {string} title
 * @param {string} description
 * @returns {Promise<{ category: string, priority: string, reasoning: string | null }>}
 */
export const suggestCategoryAndPriority = async (title, description = '') => {
  try {
    const model = getMistralModel({ temperature: 0.3 });

    const structuredModel = model.withStructuredOutput(suggestCategoryOutputSchema, {
      name: 'suggest_category',
    });

    const systemPrompt = new SystemMessage(
      `You are a smart task categorization assistant for a productivity app called TaskflowAI.
Your job is to suggest the most appropriate category and priority for a task based on its title and description.

Available categories: work, personal, health, finance, shopping, learning, home, social.
Priority levels: low (no deadline pressure), medium (normal task), high (time-sensitive or critical).

Be practical and think like a productive professional. Lean toward the user's likely intent.
Provide a brief, friendly one-sentence reasoning for your suggestion.`
    );

    const taskContext = description
      ? `Task title: "${title}"\nDescription: "${description}"`
      : `Task title: "${title}"`;

    const humanMessage = new HumanMessage(taskContext);

    const result = await structuredModel.invoke([systemPrompt, humanMessage]);

    return {
      category: result.category,
      priority: result.priority,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('[AIService] suggestCategoryAndPriority failed:', error.message);

    // Safe fallback — return neutral defaults silently.
    // The frontend treats a null reasoning as "no suggestion chip to show".
    return {
      category: 'general',
      priority: 'medium',
      reasoning: null,
    };
  }
};
