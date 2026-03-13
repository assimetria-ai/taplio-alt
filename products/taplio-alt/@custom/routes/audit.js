// @custom — User Activity Audit Log API
//
// Searchable audit trail with CSV export for Taplio Alt.
//
// GET /api/audit          — list audit log entries (paginated, filterable)
// GET /api/audit/export   — export audit log as CSV

'use strict'

const express  = require('express')
const router   = express.Router()
const db       = require('../../server/src/lib/@system/PostgreSQL')
const logger   = require('../../server/src/lib/@system/Logger')
const {
  asyncHandler,
  authenticate,
} = require('../../server/src/lib/@system/Helpers')

// ── List audit entries ────────────────────────────────────────────────────────
//
// GET /api/audit?q=login&action=user.login&user_id=5&from=2026-01-01&to=2026-03-01&page=1&limit=50
//
// Query params:
//   q         {string}  — free-text search across action, resource_type, resource_id, meta
//   action    {string}  — filter by action prefix (e.g. 'post.' matches all post events)
//   user_id   {number}  — filter by specific user
//   from      {string}  — ISO date, entries created_at >= from
//   to        {string}  — ISO date, entries created_at <= to
//   page      {number}  — page number (default 1)
//   limit     {number}  — entries per page (1-200, default 50)
//   sort_by   {string}  — column to sort by (default created_at)
//   order     {string}  — asc or desc (default desc)

const ALLOWED_SORT = ['created_at', 'action', 'resource_type']

router.get('/audit', authenticate, asyncHandler(async (req, res) => {
  // Only admins can view the full audit log; regular users see only their own
  const isAdmin = req.user.role === 'admin'

  const limit  = Math.min(Math.max(1, parseInt(req.query.limit ?? '50', 10)), 200)
  const page   = Math.max(1, parseInt(req.query.page ?? '1', 10))
  const offset = (page - 1) * limit

  const sortBy = ALLOWED_SORT.includes(req.query.sort_by) ? req.query.sort_by : 'created_at'
  const order  = req.query.order === 'asc' ? 'ASC' : 'DESC'

  const conditions = []
  const values     = []

  // Scope to own entries unless admin
  if (!isAdmin) {
    values.push(req.user.id)
    conditions.push(`a.user_id = $${values.length}`)
  }

  // Filter by user_id (admin only)
  if (req.query.user_id && isAdmin) {
    values.push(parseInt(req.query.user_id, 10))
    conditions.push(`a.user_id = $${values.length}`)
  }

  // Filter by action prefix
  if (req.query.action) {
    values.push(`${req.query.action}%`)
    conditions.push(`a.action LIKE $${values.length}`)
  }

  // Date range
  if (req.query.from) {
    values.push(req.query.from)
    conditions.push(`a.created_at >= $${values.length}::timestamptz`)
  }
  if (req.query.to) {
    values.push(req.query.to)
    conditions.push(`a.created_at <= $${values.length}::timestamptz`)
  }

  // Free-text search
  if (req.query.q) {
    values.push(`%${req.query.q}%`)
    const idx = values.length
    conditions.push(`(a.action ILIKE $${idx} OR a.resource_type ILIKE $${idx} OR a.resource_id ILIKE $${idx} OR a.meta::text ILIKE $${idx})`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const [rows, countRow] = await Promise.all([
    db.any(
      `SELECT a.id, a.user_id, u.email AS user_email, u.name AS user_name,
              a.action, a.resource_type, a.resource_id, a.meta, a.ip,
              a.created_at
         FROM audit_log a
         LEFT JOIN users u ON u.id = a.user_id
         ${where}
         ORDER BY a.${sortBy} ${order}
         LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    ),
    db.one(
      `SELECT COUNT(*) AS total FROM audit_log a ${where}`,
      values
    ),
  ])

  const total = parseInt(countRow.total, 10)

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}))

// ── Export as CSV ──────────────────────────────────────────────────────────────
//
// GET /api/audit/export?action=post.&from=2026-01-01&to=2026-03-01
// Same filters as the list endpoint. Returns all matching rows as CSV.

router.get('/audit/export', authenticate, asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin'

  const conditions = []
  const values     = []

  if (!isAdmin) {
    values.push(req.user.id)
    conditions.push(`a.user_id = $${values.length}`)
  }

  if (req.query.user_id && isAdmin) {
    values.push(parseInt(req.query.user_id, 10))
    conditions.push(`a.user_id = $${values.length}`)
  }
  if (req.query.action) {
    values.push(`${req.query.action}%`)
    conditions.push(`a.action LIKE $${values.length}`)
  }
  if (req.query.from) {
    values.push(req.query.from)
    conditions.push(`a.created_at >= $${values.length}::timestamptz`)
  }
  if (req.query.to) {
    values.push(req.query.to)
    conditions.push(`a.created_at <= $${values.length}::timestamptz`)
  }
  if (req.query.q) {
    values.push(`%${req.query.q}%`)
    const idx = values.length
    conditions.push(`(a.action ILIKE $${idx} OR a.resource_type ILIKE $${idx} OR a.resource_id ILIKE $${idx} OR a.meta::text ILIKE $${idx})`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  // Cap at 10000 rows for CSV export
  const rows = await db.any(
    `SELECT a.id, a.user_id, u.email AS user_email, u.name AS user_name,
            a.action, a.resource_type, a.resource_id, a.meta, a.ip,
            a.created_at
       FROM audit_log a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT 10000`,
    values
  )

  // Build CSV
  const headers = ['ID', 'Timestamp', 'User ID', 'User Email', 'User Name', 'Action', 'Resource Type', 'Resource ID', 'IP', 'Details']

  function escapeCsv(val) {
    if (val == null) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvLines = [headers.join(',')]
  for (const r of rows) {
    csvLines.push([
      r.id,
      r.created_at,
      r.user_id ?? '',
      escapeCsv(r.user_email),
      escapeCsv(r.user_name),
      escapeCsv(r.action),
      escapeCsv(r.resource_type),
      escapeCsv(r.resource_id),
      escapeCsv(r.ip),
      escapeCsv(typeof r.meta === 'object' ? JSON.stringify(r.meta) : r.meta),
    ].join(','))
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  res.setHeader('Content-Disposition', `attachment; filename="audit-log-${ts}.csv"`)
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.send(csvLines.join('\n'))
}))

module.exports = router
