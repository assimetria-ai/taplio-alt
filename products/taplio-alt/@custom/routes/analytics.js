// @custom — Analytics API routes
//
// Dashboard and engagement analytics powered by the post_metrics table.
//
// GET /api/analytics/overview             — dashboard stats (total posts, impressions, engagement)
// GET /api/analytics/engagement           — engagement metrics with date range filter
// GET /api/analytics/engagement/trends    — engagement trends over time (daily buckets)
// GET /api/analytics/performance          — top-performing posts ranked by engagement

'use strict'

const express  = require('express')
const router   = express.Router()
const db       = require('../../server/src/lib/@system/PostgreSQL')
const logger   = require('../../server/src/lib/@system/Logger')
const {
  asyncHandler,
  authenticate,
} = require('../../server/src/lib/@system/Helpers')

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse optional date range from query params.
 * Returns { fromDate, toDate } with sensible defaults (last 30 days).
 */
function parseDateRange(query) {
  const now    = new Date()
  const toDate = query.to
    ? new Date(query.to)
    : now
  const fromDate = query.from
    ? new Date(query.from)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  return { fromDate: fromDate.toISOString(), toDate: toDate.toISOString() }
}

// ── Overview ──────────────────────────────────────────────────────────────────

// GET /api/analytics/overview
// Returns high-level dashboard stats for the authenticated user:
//   total_posts, published_posts, total_impressions, total_likes,
//   total_comments, total_shares, avg_engagement_rate
router.get('/analytics/overview', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id

  const postStats = await db.query(
    `SELECT
       COUNT(*)::int                                    AS total_posts,
       COUNT(*) FILTER (WHERE status = 'published')::int AS published_posts
     FROM posts
     WHERE user_id = $1`,
    [userId]
  )

  const metricStats = await db.query(
    `SELECT
       COALESCE(SUM(pm.impressions), 0)::bigint          AS total_impressions,
       COALESCE(SUM(pm.likes), 0)::bigint                AS total_likes,
       COALESCE(SUM(pm.comments), 0)::bigint             AS total_comments,
       COALESCE(SUM(pm.shares), 0)::bigint               AS total_shares,
       ROUND(COALESCE(AVG(pm.engagement_rate), 0), 4)    AS avg_engagement_rate
     FROM post_metrics pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.user_id = $1`,
    [userId]
  )

  const data = {
    ...postStats.rows[0],
    ...metricStats.rows[0],
  }

  logger.info({ userId }, 'analytics overview fetched')
  res.json({ data })
}))

// ── Engagement ────────────────────────────────────────────────────────────────

// GET /api/analytics/engagement?from=2026-01-01&to=2026-03-01
// Returns aggregate engagement metrics within a date range.
router.get('/analytics/engagement', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { fromDate, toDate } = parseDateRange(req.query)

  const result = await db.query(
    `SELECT
       COUNT(pm.id)::int                                  AS posts_with_metrics,
       COALESCE(SUM(pm.impressions), 0)::bigint           AS total_impressions,
       COALESCE(SUM(pm.likes), 0)::bigint                 AS total_likes,
       COALESCE(SUM(pm.comments), 0)::bigint              AS total_comments,
       COALESCE(SUM(pm.shares), 0)::bigint                AS total_shares,
       ROUND(COALESCE(AVG(pm.engagement_rate), 0), 4)     AS avg_engagement_rate,
       COALESCE(MAX(pm.engagement_rate), 0)                AS max_engagement_rate,
       COALESCE(MIN(pm.engagement_rate), 0)                AS min_engagement_rate
     FROM post_metrics pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.user_id = $1
       AND pm.recorded_at >= $2
       AND pm.recorded_at <= $3`,
    [userId, fromDate, toDate]
  )

  logger.info({ userId, fromDate, toDate }, 'analytics engagement fetched')
  res.json({
    data: result.rows[0],
    meta: { from: fromDate, to: toDate },
  })
}))

// ── Engagement Trends ─────────────────────────────────────────────────────────

// GET /api/analytics/engagement/trends?from=2026-01-01&to=2026-03-01&interval=day
// Returns engagement metrics bucketed by day (default) or week.
router.get('/analytics/engagement/trends', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const { fromDate, toDate } = parseDateRange(req.query)
  const interval = req.query.interval === 'week' ? 'week' : 'day'

  const result = await db.query(
    `SELECT
       date_trunc($4, pm.recorded_at)::date               AS date,
       COUNT(pm.id)::int                                   AS post_count,
       COALESCE(SUM(pm.impressions), 0)::bigint            AS impressions,
       COALESCE(SUM(pm.likes), 0)::bigint                  AS likes,
       COALESCE(SUM(pm.comments), 0)::bigint               AS comments,
       COALESCE(SUM(pm.shares), 0)::bigint                 AS shares,
       ROUND(COALESCE(AVG(pm.engagement_rate), 0), 4)      AS avg_engagement_rate
     FROM post_metrics pm
     JOIN posts p ON p.id = pm.post_id
     WHERE p.user_id = $1
       AND pm.recorded_at >= $2
       AND pm.recorded_at <= $3
     GROUP BY date_trunc($4, pm.recorded_at)
     ORDER BY date ASC`,
    [userId, fromDate, toDate, interval]
  )

  logger.info({ userId, fromDate, toDate, interval }, 'analytics engagement trends fetched')
  res.json({
    data: result.rows,
    meta: { from: fromDate, to: toDate, interval },
  })
}))

// ── Performance ───────────────────────────────────────────────────────────────

// GET /api/analytics/performance?limit=10&sort_by=engagement_rate&order=desc
// Returns top-performing posts with their metrics.
router.get('/analytics/performance', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user.id
  const limit  = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)

  const allowedSort = ['engagement_rate', 'impressions', 'likes', 'comments', 'shares']
  const sortBy = allowedSort.includes(req.query.sort_by) ? req.query.sort_by : 'engagement_rate'
  const order  = req.query.order === 'asc' ? 'ASC' : 'DESC'

  const result = await db.query(
    `SELECT
       p.id,
       p.content,
       p.status,
       p.published_at,
       p.hashtags,
       pm.impressions,
       pm.likes,
       pm.comments,
       pm.shares,
       pm.engagement_rate,
       pm.recorded_at
     FROM posts p
     JOIN post_metrics pm ON pm.post_id = p.id
     WHERE p.user_id = $1
     ORDER BY pm.${sortBy} ${order}
     LIMIT $2`,
    [userId, limit]
  )

  logger.info({ userId, sortBy, order, limit }, 'analytics performance fetched')
  res.json({ data: result.rows })
}))

module.exports = router
