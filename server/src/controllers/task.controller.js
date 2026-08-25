import * as TaskService from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { validate, isValidObjectId } from '../utils/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validators/task.validator.js';

// ─── ObjectId guard ───────────────────────────────────────────────────────────
// Reusable check: if the :id param isn't a valid MongoDB ObjectId, we reject
// immediately before hitting the database. This prevents Mongoose CastErrors
// from leaking through the error handler with a confusing message.
const checkObjectId = (id) => {
  if (!isValidObjectId(id)) {
    throw ApiError.badRequest('Invalid ID format. Task IDs must be 24-character hex strings.');
  }
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/tasks
 * Returns all tasks for the logged-in user, with optional filters/search/sort.
 */
export const getTasks = asyncHandler(async (req, res) => {
  // Query params come in as strings — the taskQuerySchema coerces them
  // (e.g. "true" → true, "1" → 1). Validate the query, not just the body.
  const queryOptions = validate(taskQuerySchema, req.query);

  const result = await TaskService.getTasks(req.user._id, queryOptions);

  return res.status(200).json({
    success: true,
    message: 'Tasks fetched successfully.',
    data: result,
  });
});

/**
 * GET /api/v1/tasks/:id
 * Returns a single task. The service will 404 if not found, 403 if not the owner.
 */
export const getTask = asyncHandler(async (req, res) => {
  checkObjectId(req.params.id);

  const task = await TaskService.getTaskById(req.params.id, req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Task fetched successfully.',
    data: { task },
  });
});

/**
 * POST /api/v1/tasks
 * Creates a new task for the logged-in user.
 */
export const createTask = asyncHandler(async (req, res) => {
  const taskData = validate(createTaskSchema, req.body);

  const task = await TaskService.createTask(req.user._id, taskData);

  return res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: { task },
  });
});

/**
 * PUT /api/v1/tasks/:id
 * Updates a task. Only the fields provided in the body are changed.
 * The service verifies ownership before updating.
 */
export const updateTask = asyncHandler(async (req, res) => {
  checkObjectId(req.params.id);

  const updates = validate(updateTaskSchema, req.body);

  const task = await TaskService.updateTask(req.params.id, req.user._id, updates);

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: { task },
  });
});

/**
 * DELETE /api/v1/tasks/:id
 * Deletes a task. The service verifies ownership before deleting.
 */
export const deleteTask = asyncHandler(async (req, res) => {
  checkObjectId(req.params.id);

  await TaskService.deleteTask(req.params.id, req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully.',
    data: null,
  });
});

/**
 * PATCH /api/v1/tasks/:id/toggle
 * Toggles the completed status of a task.
 * A dedicated endpoint for this common action keeps the frontend simple —
 * it just sends PATCH /toggle instead of a full PUT with all fields.
 */
export const toggleTask = asyncHandler(async (req, res) => {
  checkObjectId(req.params.id);

  const task = await TaskService.toggleTaskComplete(req.params.id, req.user._id);

  return res.status(200).json({
    success: true,
    message: `Task marked as ${task.completed ? 'completed' : 'pending'}.`,
    data: { task },
  });
});
