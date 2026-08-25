import { User } from '../models/user.model.js';

/**
 * UserRepository — pure data-access layer for the User collection.
 *
 * No business logic lives here. This layer only knows how to talk to MongoDB
 * via Mongoose. Services call repositories; repositories never call services.
 *
 * Keeping DB queries isolated here means:
 *   - Easier to test (swap out the model with a mock)
 *   - Business logic stays clean and readable in the service layer
 *   - A single place to change if we ever switch ORMs or databases
 */

/**
 * Find a user by email address.
 * Used by signup (duplicate check) and login.
 *
 * Note: passwordHash is excluded by `select: false` on the schema.
 * For login we need to compare passwords, so we explicitly select it here.
 *
 * @param {string}  email
 * @param {boolean} withPassword - include passwordHash in the result
 * @returns {Promise<import('../models/user.model.js').User | null>}
 */
export const findByEmail = async (email, withPassword = false) => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  if (withPassword) query.select('+passwordHash');
  return query.lean(false); // keep Mongoose document so instance methods work
};

/**
 * Find a user by their MongoDB ObjectId.
 * Used by the auth middleware to validate a JWT's sub claim.
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {Promise<import('../models/user.model.js').User | null>}
 */
export const findById = async (id) => {
  return User.findById(id);
};

/**
 * Persist a new user to the database.
 * The caller (AuthService) is responsible for pre-hashing the password.
 *
 * @param {{ name: string, email: string, passwordHash: string }} userData
 * @returns {Promise<import('../models/user.model.js').User>}
 */
export const createUser = async ({ name, email, passwordHash }) => {
  const user = new User({ name, email, passwordHash });
  return user.save();
};
