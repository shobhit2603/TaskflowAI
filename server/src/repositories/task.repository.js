import { Task } from '../models/task.model.js';

// ─────────────────────────────────────────────────────────────────────────────
// TaskRepository — all MongoDB queries for the Task collection.
//
// The key rule here: every single query filters by `userId`.
// Tasks are private to the user who created them. By enforcing this at the
// repository level, there's no way a service can accidentally fetch another
// user's tasks — the ownership filter is always there.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all tasks for a user with optional filtering, searching, and sorting.
 *
 * This is the most complex query in the app. Breaking down the logic:
 *   - `filter` always starts with { user: userId } — enforces ownership
 *   - We add to the filter object based on what query params were sent
 *   - $text search requires a text index (added to the model)
 *   - We use .skip() + .limit() for simple pagination
 *
 * @param {string} userId
 * @param {object} options - from taskQuerySchema
 */
export const findAllByUser = async (userId, options = {}) => {
  const {
    search,
    priority,
    category,
    completed,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 20,
  } = options;

  // Start with ownership filter — always required
  const filter = { user: userId };

  // Add optional filters only when they were provided
  if (priority) filter.priority = priority;
  if (category) filter.category = { $regex: category, $options: 'i' }; // case-insensitive
  if (completed !== undefined) filter.completed = completed;

  // Text search: look in both title and description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object: e.g. { createdAt: -1 } or { dueDate: 1 }
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Pagination
  const skip = (page - 1) * limit;

  // Run query + total count in parallel for efficiency
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, total, page, limit };
};

/**
 * Find a single task by ID.
 * Does NOT filter by user — ownership check is done in the service layer.
 * This keeps the repository simple and the security logic explicit in the service.
 *
 * @param {string} taskId
 */
export const findById = async (taskId) => {
  return Task.findById(taskId);
};

/**
 * Create a new task for a user.
 *
 * @param {string} userId
 * @param {object} taskData - validated data from the controller
 */
export const createTask = async (userId, taskData) => {
  const task = new Task({ ...taskData, user: userId });
  return task.save();
};

/**
 * Update a task by ID and return the updated document.
 * We use { new: true } so Mongoose returns the updated doc, not the old one.
 *
 * @param {string} taskId
 * @param {object} updates - partial task data
 */
export const updateTask = async (taskId, updates) => {
  return Task.findByIdAndUpdate(taskId, updates, {
    new: true,         // return the updated document
    runValidators: true, // re-run schema validators on the updated fields
  });
};

/**
 * Delete a task by ID.
 *
 * @param {string} taskId
 */
export const deleteTask = async (taskId) => {
  return Task.findByIdAndDelete(taskId);
};

/**
 * Find all tasks with reminders that are due and haven't been sent yet.
 * Used by the cron job in the reminder service.
 *
 * @param {Date} now
 */
export const findDueReminders = async (now = new Date()) => {
  return Task.find({
    'reminder.enabled': true,
    'reminder.sent': false,
    'reminder.remindAt': { $lte: now },
  }).populate('user', 'name email'); // we need the user's email to send the reminder
};
