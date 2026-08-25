import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All AI routes require authentication.
// Reason: AI calls cost money (Mistral API quota). Anonymous access would let
// anyone burn through your API key — authentication is a basic rate-limiting
// mechanism even before you add proper per-user rate limiting.
router.use(protect);

/**
 * @route  POST /api/v1/ai/parse-task
 * @desc   Parse natural-language text into structured task fields
 * @body   { text: string }
 * @access Private
 */
router.post('/parse-task', aiController.parseTask);

/**
 * @route  POST /api/v1/ai/suggest-category
 * @desc   Suggest a category and priority for a task based on title + description
 * @body   { title: string, description?: string }
 * @access Private
 */
router.post('/suggest-category', aiController.suggestCategory);

export default router;
