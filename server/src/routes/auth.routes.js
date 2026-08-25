import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route  POST /api/v1/auth/signup
 * @desc   Register a new user account
 * @access Public
 */
router.post('/signup', authController.signup);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Authenticate user and return a JWT
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route  GET /api/v1/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Private (requires valid JWT in Authorization header)
 */
router.get('/me', protect, authController.getMe);

export default router;
