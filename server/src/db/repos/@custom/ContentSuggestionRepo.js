/**
 * @custom ContentSuggestionRepo
 * Data access for content_suggestions and optimal_posting_times tables.
 */
const db = require('../@system/db-instance')

const ContentSuggestionRepo = {
  // ── Content Suggestions ─────────────────────────────────────────────────

  async create({ userId, industry, topics, suggestions, model, tokensUsed }) {
    return db.one(
      `INSERT INTO content_suggestions (user_id, industry, topics, suggestions, model, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, industry || null, topics || [], JSON.stringify(suggestions), model || null, tokensUsed || 0]
    )
  },

  async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    return db.any(
      `SELECT * FROM content_suggestions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
  },

  async findById(id, userId) {
    return db.oneOrNone(
      'SELECT * FROM content_suggestions WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
  },

  async delete(id, userId) {
    return db.result(
      'DELETE FROM content_suggestions WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
  },

  // ── Optimal Posting Times ────────────────────────────────────────────────

  async upsertPostingTime({ userId, timezone, dayOfWeek, hour, score, sampleSize }) {
    return db.one(
      `INSERT INTO optimal_posting_times (user_id, timezone, day_of_week, hour, score, sample_size, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (user_id, timezone, day_of_week, hour)
       DO UPDATE SET
         score       = EXCLUDED.score,
         sample_size = EXCLUDED.sample_size,
         updated_at  = now()
       RETURNING *`,
      [userId, timezone, dayOfWeek, hour, score, sampleSize || 0]
    )
  },

  async getPostingTimes(userId, { timezone, dayOfWeek } = {}) {
    const conditions = ['user_id = $1']
    const params = [userId]
    let idx = 2

    if (timezone) {
      conditions.push(`timezone = $${idx}`)
      params.push(timezone)
      idx++
    }
    if (dayOfWeek !== undefined && dayOfWeek !== null) {
      conditions.push(`day_of_week = $${idx}`)
      params.push(dayOfWeek)
      idx++
    }

    return db.any(
      `SELECT * FROM optimal_posting_times
       WHERE ${conditions.join(' AND ')}
       ORDER BY score DESC`,
      params
    )
  },

  async getTopPostingSlots(userId, { timezone, limit = 5 } = {}) {
    const params = [userId]
    let timezoneClause = ''
    if (timezone) {
      params.push(timezone)
      timezoneClause = `AND timezone = $${params.length}`
    }
    params.push(limit)
    return db.any(
      `SELECT * FROM optimal_posting_times
       WHERE user_id = $1 ${timezoneClause}
       ORDER BY score DESC
       LIMIT $${params.length}`,
      params
    )
  },
}

module.exports = ContentSuggestionRepo
