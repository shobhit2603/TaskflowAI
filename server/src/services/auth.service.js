import { User } from '../models/user.model.js';
import * as UserRepository from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

/**
 * AuthService — all authentication business logic.
 *
 * This layer owns the rules: "what makes a valid signup?", "what does a
 * successful login look like?". It doesn't know about HTTP (no req/res),
 * and it doesn't know how to store data (no Mongoose calls). It delegates
 * persistence to UserRepository and token creation to jwt utils.
 *
 * Keeping this separation means the same logic can be called from a REST
 * controller, a CLI script, or a test — without any HTTP scaffolding.
 */

/**
 * signup — registers a new user.
 *
 * Flow:
 *   1. Check the email isn't already taken (409 if it is)
 *   2. Hash the password via User.hashPassword() (bcrypt static)
 *   3. Persist the user via UserRepository.createUser()
 *   4. Generate a signed JWT
 *   5. Return { user, token } — controller decides the HTTP shape
 *
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const signup = async ({ name, email, password }) => {
  // Duplicate email check
  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists.');
  }

  // Hash the password — bcrypt work factor is set in the model static
  const passwordHash = await User.hashPassword(password);

  // Persist new user
  const user = await UserRepository.createUser({ name, email, passwordHash });

  // Issue JWT — payload: minimal, no sensitive fields
  const token = generateToken({ id: user._id, email: user.email });

  return { user, token };
};

/**
 * login — authenticates an existing user by email + password.
 *
 * Flow:
 *   1. Find user by email, explicitly selecting passwordHash (excluded by default)
 *   2. Verify password via model instance method
 *   3. Return { user, token } on success; throw ApiError(401) on failure
 *
 * We deliberately return the same generic message for "user not found" and
 * "wrong password" to avoid user enumeration (don't tell attackers which
 * accounts exist).
 *
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ user: object, token: string }>}
 */
export const login = async ({ email, password }) => {
  // Fetch with passwordHash (excluded by select:false on schema by default)
  const user = await UserRepository.findByEmail(email, true);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = generateToken({ id: user._id, email: user.email });

  return { user, token };
};

/**
 * getMe — fetches the authenticated user's profile.
 *
 * Called by the GET /me route after the auth middleware has already
 * validated the token and attached req.user. We do a fresh DB fetch
 * here rather than returning req.user directly to ensure we always
 * return current data (e.g. if a user's name was updated elsewhere).
 *
 * @param {string} userId - MongoDB ObjectId from the verified JWT payload
 * @returns {Promise<object>} User document (passwordHash stripped by toJSON)
 */
export const getMe = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found.');
  }
  return user;
};
