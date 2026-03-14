/**
 * @custom AIEngineRepo
 * Data access for ai_engine_requests — audit trail for all AI content engine calls.
 */

const db = require('../@system/db-instance')

const AIEngineRepo = {
  /**
   * Record an AI engine request and its response.
   *
   * @param {object} opts
   * @param {number} opts.userId        - Authenticated user ID
   * @param {string} opts.endpoint      - Which endpoint was called (suggest-content | optimal-times | predict-performance | hashtags)
   * @param {object} opts.input         - Request input payload
   * @param {object} opts.output        - AI response payload
   * @param {string} [opts.model]       - OpenAI model used
   * @param {number} [opts.tokensUsed]  - Total tokens consumed
   * @returns {Promise<object>}
   */
  async create({ userId, endpoint, input, output, model, tokensUsed }) {
    return db.one(
      `INSERT INTO ai_engine_requests
         (user_id, endpoint, input, output, model, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        endpoint,
        JSON.stringify(input),
        JSON.stringify(output),
        model || null,
        tokensUsed || 0,
      ]
    )
  },

  /**
   * Retrieve paginated request history for a user.
   *
   * @param {number} userId
   * @param {object} [opts]
   * @param {string} [opts.endpoint]  - Filter by endpoint type
   * @param {number} [opts.limit]
   * @param {number} [opts.offset]
   * @returns {Promise<Array>}
   */
  async findByUser(userId, { endpoint, limit = 20, offset = 0 } = {}) {
    const conditions = ['user_id = $1']
    const params = [userId]
    let idx = 2

    if (endpoint) {
      conditions.push(`endpoint = $${idx}`)
      params.push(endpoint)
      idx++
    }

    params.push(limit, offset)
    return db.any(
      `SELECT id, endpoint, input, output, model, tokens_used, created_at
       FROM ai_engine_requests
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    )
  },

  /**
   * Count total requests by user (optionally filtered by endpoint).
   *
   * @param {number} userId
   * @param {string} [endpoint]
   * @returns {Promise<number>}
   */
  async countByUser(userId, endpoint) {
    const conditions = ['user_id = $1']
    const params = [userId]

    if (endpoint) {
      conditions.push('endpoint = $2')
      params.push(endpoint)
    }

    const row = await db.one(
      `SELECT COUNT(*)::int AS total FROM ai_engine_requests WHERE ${conditions.join(' AND ')}`,
      params
    )
    return row.total
  },

  /**
   * Aggregate token usage per user over a time window (for rate-limit awareness).
   *
   * @param {number} userId
   * @param {string} since  - ISO timestamp lower bound
   * @returns {Promise<{ total_requests: number, total_tokens: number }>}
   */
  async usageSince(userId, since) {
    return db.one(
      `SELECT
         COUNT(*)::int        AS total_requests,
         COALESCE(SUM(tokens_used), 0)::int AS total_tokens
       FROM ai_engine_requests
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, since]
    )
  },
}

module.exports = AIEngineRepo
