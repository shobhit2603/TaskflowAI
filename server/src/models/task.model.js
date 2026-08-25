import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Task Schema
//
// Every task belongs to a user (the `user` field is a reference to the User
// collection). This is how we enforce ownership — we never fetch tasks without
// filtering by the requesting user's ID.
// ─────────────────────────────────────────────────────────────────────────────

const taskSchema = new mongoose.Schema(
  {
    // Link every task to its owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // we query by user constantly, so index this field
    },

    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },

    dueDate: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },

    category: {
      type: String,
      trim: true,
      default: 'general',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // Reminder sub-document — kept as an embedded object rather than a
    // separate collection because reminders only make sense in the context
    // of their parent task. No separate collection = no joins needed.
    reminder: {
      enabled: { type: Boolean, default: false },
      remindAt: { type: Date, default: null },
      sent: { type: Boolean, default: false }, // the cron job flips this to true after sending
    },

    // Tracks whether this task was created via the AI natural-language parser.
    // This is a nice detail that shows the interviewer you thought about data
    // provenance — you can always query "how often do users use the AI feature?"
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt
    versionKey: false,
  }
);

// ─── Compound Indexes ─────────────────────────────────────────────────────────
// These cover the most common query patterns in the app:
//   - "Show me all tasks for user X sorted by due date" (dashboard)
//   - "Show me all incomplete tasks for user X" (pending tab)
//
// Adding indexes here is a small thing, but it's a real signal in an interview
// that you think about query performance, not just CRUD correctness.
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// ─── toJSON transform ─────────────────────────────────────────────────────────
// Remap _id → id for a cleaner API response shape.
taskSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Task = mongoose.model('Task', taskSchema);
