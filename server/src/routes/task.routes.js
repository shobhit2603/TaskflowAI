import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// All task routes require authentication.
// We apply `protect` once here at the router level instead of adding it to
// every individual route — cleaner, and impossible to forget on a new route.
router.use(protect);

/**
 * @route  GET  /api/v1/tasks
 * @desc   Get all tasks for the authenticated user (with filter/search/sort/pagination)
 * @query  search, priority, category, completed, sortBy, order, page, limit
 */
router.get('/', taskController.getTasks);

/**
 * @route  POST /api/v1/tasks
 * @desc   Create a new task
 */
router.post('/', taskController.createTask);

/**
 * @route  GET  /api/v1/tasks/:id
 * @desc   Get a single task by ID
 */
router.get('/:id', taskController.getTask);

/**
 * @route  PUT  /api/v1/tasks/:id
 * @desc   Update a task (partial update — send only the fields you want to change)
 */
router.put('/:id', taskController.updateTask);

/**
 * @route  DELETE /api/v1/tasks/:id
 * @desc   Delete a task permanently
 */
router.delete('/:id', taskController.deleteTask);

/**
 * @route  PATCH /api/v1/tasks/:id/toggle
 * @desc   Toggle the completed status of a task (true → false or false → true)
 */
router.patch('/:id/toggle', taskController.toggleTask);

export default router;
