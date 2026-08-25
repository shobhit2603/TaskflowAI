import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },

    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [60, 'Password hash must be a valid bcrypt hash'], // bcrypt hashes are 60 chars
      select: false, // never returned in queries by default; caller must explicitly .select('+passwordHash')
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
    versionKey: false,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// email already indexed via `index: true` in the field definition.
// Compound indexes for common query patterns can be added as tasks grow.

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * comparePassword — compares a plain-text password against the stored hash.
 *
 * Keeping this on the model means no service or controller ever imports bcrypt
 * directly — hashing logic lives exactly where it belongs.
 *
 * @param {string} plainPassword - Password from the login request body
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ─── toJSON transform ─────────────────────────────────────────────────────────
// Strips sensitive fields before the document is serialised to JSON.
// This is a defence-in-depth measure — passwordHash is never sent to the client
// even if a developer forgets to exclude it in a query.
userSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.passwordHash; // never expose bcrypt hash over the wire
    return ret;
  },
});

// ─── Static helpers ──────────────────────────────────────────────────────────

/**
 * hashPassword — hashes a plain-text password with bcrypt.
 *
 * Exposed as a static so the auth service can pre-hash before calling
 * repository.createUser(), keeping the repository layer free of crypto logic.
 *
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
};

export const User = mongoose.model('User', userSchema);
