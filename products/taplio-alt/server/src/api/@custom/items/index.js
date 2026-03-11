// @custom — items CRUD scaffold
//
// This route is the canonical example of how to wire up pagination, search,
// and CRUD helpers for a new resource type. Copy and rename for your own models.
//
// GET    /api/items       — list items (paginated + searchable + filterable)
// GET    /api/items/:id   — get single item
// POST   /api/items       — create item  (auth required)
// PATCH  /api/items/:id   — update item  (auth required, owner or admin)
// DELETE /api/items/:id   — delete item  (auth required, owner or admin)

'use strict'

const express  = require('express')
const router   = express.Router()
const db       = require('../../../lib/@system/PostgreSQL')
const logger   = require('../../../lib/@system/Logger')
const { validateBody } = require('../../../lib/@system/Middleware/validate')
const {
  asyncHandler,
  authenticate,
  requireOwnerOrAdmin,
  listQuery,
  findById,
  assertFound,
  create,
  update,
  remove,
} = require('../../../lib/@system/Helpers')

// ── Config ────────────────────────────────────────────────────────────────────
// Adjust TABLE, SEARCH_COLUMNS, ALLOWED_FILTERS, and ALLOWED_SORT when copying.

const TABLE           = 'items'
const SEARCH_COLUMNS  = ['title', 'body']
const ALLOWED_FILTERS = ['status']
const ALLOWED_SORT    = ['title', 'status', 'created_at', 'updated_at']

// ── Validation rules ──────────────────────────────────────────────────────────

const VALID_STATUSES = ['draft', 'published', 'archived']

const CREATE_RULES = {
  title:  { required: true, type: 'string', maxLength: 200 },
  body:   { type: 'string' },
  status: { type: 'string', allowedValues: VALID_STATUSES },
}

const UPDATE_RULES = {
  title:  { type: 'string', maxLength: 200 },
  body:   { type: 'string' },
  status: { type: 'string', allowedValues: VALID_STATUSES },
}

// ── List ──────────────────────────────────────────────────────────────────────

// GET /api/items?q=text&status=published&page=1&limit=20&sort_by=title&order=asc
router.get('/items', asyncHandler(async (req, res) => {
  const result = await listQuery(db, TABLE, req.query, {
    searchColumns:  SEARCH_COLUMNS,
    allowedFilters: ALLOWED_FILTERS,
    allowedSort:    ALLOWED_SORT,
  })
  res.json(result)
}))

// ── Single ────────────────────────────────────────────────────────────────────

// GET /api/items/:id
router.get('/items/:id', asyncHandler(async (req, res) => {
  const item = assertFound(
    await findById(db, TABLE, req.params.id),
    'Item not found'
  )
  res.json({ data: item })
}))

// ── Create ────────────────────────────────────────────────────────────────────

// POST /api/items
router.post('/items', authenticate, validateBody(CREATE_RULES), asyncHandler(async (req, res) => {
  const { title, body, status = 'draft' } = req.body

  const item = await create(db, TABLE, {
    title:   title.trim(),
    body:    body ?? null,
    status,
    user_id: req.user.id,
  })

  logger.info({ itemId: item.id, userId: req.user.id }, 'item created')
  res.status(201).json({ data: item })
}))

// ── Update ────────────────────────────────────────────────────────────────────

// PATCH /api/items/:id
router.patch(
  '/items/:id',
  authenticate,
  requireOwnerOrAdmin(async req => {
    const row = await findById(db, TABLE, req.params.id)
    req.resource = row   // cache for handler so we don't fetch twice
    return row?.user_id
  }),
  validateBody(UPDATE_RULES),
  asyncHandler(async (req, res) => {
    const { title, body, status } = req.body

    const item = await update(db, TABLE, req.params.id, {
      title:  title !== undefined ? title.trim() : undefined,
      body,
      status,
    })

    logger.info({ itemId: item.id, userId: req.user.id }, 'item updated')
    res.json({ data: item })
  })
)

// ── Delete ────────────────────────────────────────────────────────────────────

// DELETE /api/items/:id
router.delete(
  '/items/:id',
  authenticate,
  requireOwnerOrAdmin(async req => {
    const row = await findById(db, TABLE, req.params.id)
    req.resource = row
    return row?.user_id
  }),
  asyncHandler(async (req, res) => {
    await remove(db, TABLE, req.params.id)
    logger.info({ itemId: req.params.id, userId: req.user.id }, 'item deleted')
    res.status(204).end()
  })
)

module.exports = router
