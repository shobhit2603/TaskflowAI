import * as TaskRepository from '../repositories/task.repository.js';
import { ApiError } from '../utils/apiError.js';

// ─────────────────────────────────────────────────────────────────────────────
// TaskService — business logic for task management.
//
// The most important rule here is "ownership check" — before any update or
// delete, we verify the task belongs to the requesting user. This check lives
// here (in the service) rather than in the controller or repository because:
//   - Controller: shouldn't have business logic, just HTTP handling
//   - Repository: shouldn't know about users, just MongoDB
//   - Service: exactly the right place for "can this user do this?"
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all tasks for a user, with filtering/search/sort/pagination.
 *
 * @param {string} userId
 * @param {object} queryOptions - validated query params from the controller
 */
export const getTasks = async (userId, queryOptions) => {
  const { tasks, total, page, limit } = await TaskRepository.findAllByUser(
    userId,
    queryOptions
  );

  // Coerce to Number — Zod string defaults ('1', '20') can survive as strings
  // through the pipeline if no query params were provided.
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const totalPages = Math.ceil(total / limitNum);

  return {
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};


/**
 * Get a single task by ID — verifies the task belongs to the requesting user.
 *
 * @param {string} taskId
 * @param {string} userId
 */
export const getTaskById = async (taskId, userId) => {
  const task = await TaskRepository.findById(taskId);

  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  // Ownership check — if the task exists but belongs to another user,
  // we return 403 Forbidden, not 404. This way the API doesn't accidentally
  // reveal that a task with this ID exists.
  if (task.user.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to access this task.');
  }

  return task;
};

/**
 * Create a new task for a user.
 *
 * @param {string} userId
 * @param {object} taskData - validated data from the request body
 */
export const createTask = async (userId, taskData) => {
  const task = await TaskRepository.createTask(userId, taskData);
  return task;
};

/**
 * Update a task — checks ownership before modifying.
 *
 * @param {string} taskId
 * @param {string} userId
 * @param {object} updates - partial task data (only the fields being changed)
 */
export const updateTask = async (taskId, userId, updates) => {
  // This internally calls getTaskById which handles the ownership check.
  // We re-use this method rather than duplicating the check — DRY principle.
  await getTaskById(taskId, userId);

  const updated = await TaskRepository.updateTask(taskId, updates);
  return updated;
};

/**
 * Delete a task — checks ownership before deleting.
 *
 * @param {string} taskId
 * @param {string} userId
 */
export const deleteTask = async (taskId, userId) => {
  await getTaskById(taskId, userId);
  await TaskRepository.deleteTask(taskId);
};

/**
 * Toggle a task's completed status.
 * A convenience shortcut — the frontend "check off a task" button calls this.
 * Instead of a full PUT with all fields, we just flip the boolean.
 *
 * @param {string} taskId
 * @param {string} userId
 */
export const toggleTaskComplete = async (taskId, userId) => {
  const task = await getTaskById(taskId, userId);
  const updated = await TaskRepository.updateTask(taskId, {
    completed: !task.completed,
  });
  return updated;
};
