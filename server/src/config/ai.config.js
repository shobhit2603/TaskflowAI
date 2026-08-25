import { ChatMistralAI } from '@langchain/mistralai';
import envConfig from './env.config.js';
import { ApiError } from '../utils/apiError.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mistral AI Model Factory
//
// Why a factory function instead of a single exported instance?
// Different AI features might need different settings:
//   - Task parsing: lower temperature (0.1) for predictable structured output
//   - Future features: higher temperature for creative suggestions
//
// The factory pattern lets each feature call getMistralModel({ temperature: 0.1 })
// and get a correctly configured instance without touching global state.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guard: fail fast if the API key is missing.
 * It's better to throw a clean error at startup than to get a cryptic
 * "authentication failed" error buried inside a LangChain stack trace
 * on the first real request.
 */
if (!envConfig.MISTRAL_API_KEY) {
  console.warn(
    '\n⚠️  MISTRAL_API_KEY is not set. AI features will return 503 responses.\n'
  );
}

/**
 * getMistralModel — creates a configured ChatMistralAI instance.
 *
 * @param {object} options - Override any default config
 * @param {string} options.model - Model name (default: mistral-medium-latest)
 * @param {number} options.temperature - 0 = deterministic, 1 = creative (default: 0.2)
 * @param {number} options.maxRetries - Retries on transient errors (default: 2)
 * @returns {ChatMistralAI}
 */
const getMistralModel = (options = {}) => {
  if (!envConfig.MISTRAL_API_KEY) {
    throw ApiError.badRequest(
      'AI features are not configured. Please set MISTRAL_API_KEY.',
      [],
    );
  }

  return new ChatMistralAI({
    model: options.model || 'mistral-medium-latest',
    apiKey: envConfig.MISTRAL_API_KEY,
    // Low temperature for structured extraction — we want consistent,
    // deterministic output, not creative variation.
    temperature: options.temperature ?? 0.2,
    maxRetries: options.maxRetries ?? 2,
    ...options,
  });
};

// A default instance used by the AI service for both features.
// Exported separately so tests can mock it easily.
export const defaultMistralModel = () => getMistralModel();

export default getMistralModel;
