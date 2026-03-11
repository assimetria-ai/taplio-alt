// @system — UserRepo: database access layer for the users table

'use strict'

const db = require('../../../lib/@system/PostgreSQL')

const UserRepo = {
  /** Find a user by email. Returns the full row or null. */
  async findByEmail(email) {
    return db.oneOrNone(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
  },

  /**
   * Create a new user.
   * Returns { id, email, name }.
   */
  async create({ email, name, password_hash }) {
    return db.one(
      `INSERT INTO users (email, name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email.toLowerCase().trim(), name?.trim() || null, password_hash]
    )
  },

  /**
   * Update mutable profile fields for a user.
   * Returns public user fields.
   */
  async update(id, { name }) {
    return db.one(
      `UPDATE users
          SET name       = COALESCE($2, name),
              updated_at = now()
        WHERE id = $1
       RETURNING id, email, name, role, email_verified`,
      [id, name ?? null]
    )
  },

  /**
   * Mark a user's email as verified.
   * Returns public user fields.
   */
  async verifyEmail(userId) {
    return db.one(
      `UPDATE users
          SET email_verified = true,
              updated_at     = now()
        WHERE id = $1
       RETURNING id, email, name, role, email_verified`,
      [userId]
    )
  },
}

module.exports = UserRepo
