import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import envConfig from './config/env.config.js';
import { ApiError } from './utils/apiError.js';

// ─── Route imports ────────────────────────────────────────────────────────────
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

// CORS — restrict to allowed origins defined in env config
app.use(
  cors({
    origin: envConfig.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// HTTP request logger — only log in development to keep production logs clean
if (envConfig.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Parse JSON bodies; limit size to prevent abuse
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple liveness probe — useful for Render/Railway health check config
// and for confirming the API is reachable before running client tests.
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskflowAI API is healthy',
    data: {
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catches any request that didn't match a registered route.
// Must come AFTER all route registrations.
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found.`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Express identifies a 4-argument function as an error handler.
// All errors forwarded via next(err) or thrown inside asyncHandler land here.
//
// Design decision: we distinguish "operational" errors (ApiError instances)
// from unexpected programmer errors. Operational errors get their actual
// message sent to the client. Unexpected errors log the stack and return a
// generic 500 — never leak internal details in production.
//
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log all errors server-side for observability
  if (envConfig.NODE_ENV === 'development') {
    console.error('\n[ERROR]', err);
  } else {
    // In production, only log unexpected errors (not operational ones)
    if (!err.isOperational) {
      console.error('\n[UNEXPECTED ERROR]', err);
    }
  }

  // Operational error (ApiError) — safe to send to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? [],
    });
  }

  // Mongoose duplicate key error (e.g. unique email constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
      errors: [],
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}'.`,
      errors: [],
    });
  }

  // Mongoose ValidationError (schema-level validation)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Unexpected / programmer error — return generic 500, never expose internals
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    errors: [],
  });
});

export default app;
