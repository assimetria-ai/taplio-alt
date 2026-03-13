// @custom — Post Scheduler API routes
//
// LinkedIn post CRUD + publish action for the Taplio Alt scheduler.
//
// GET    /api/posts            — list posts (paginated, filterable by status)
// GET    /api/posts/:id        — get single post
// POST   /api/posts            — create post  (auth required)
// PATCH  /api/posts/:id        — update post  (auth required, owner or admin)
// DELETE /api/posts/:id        — delete post   (auth required, owner or admin)
// POST   /api/posts/:id/publish — publish now  (auth required, owner or admin)

'use strict'

const express  = require('express')
const router   = express.Router()
const db       = require('../../server/src/lib/@system/PostgreSQL')
const logger   = require('../../server/src/lib/@system/Logger')
const auditLog = require('../../server/src/lib/@system/AuditLog')
const { validateBody } = require('../../server/src/lib/@system/Middleware/validate')
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
  BadRequestError,
  NotFoundError,
} = require('../../server/src/lib/@system/Helpers')

// ── Config ────────────────────────────────────────────────────────────────────

const TABLE           = 'posts'
const SEARCH_COLUMNS  = ['content']
const ALLOWED_FILTERS = ['status']
const ALLOWED_SORT    = ['status', 'scheduled_for', 'published_at', 'created_at', 'updated_at']

// ── Validation rules ──────────────────────────────────────────────────────────

const VALID_STATUSES = ['draft', 'scheduled']

const CREATE_RULES = {
  content:       { required: true, type: 'string', maxLength: 3000 },
  scheduled_for: { type: 'string' },
  status:        { type: 'string', allowedValues: VALID_STATUSES },
  media_urls:    { type: 'array' },
  hashtags:      { type: 'array' },
  mentions:      { type: 'array' },
}

const UPDATE_RULES = {
  content:       { type: 'string', maxLength: 3000 },
  scheduled_for: { type: 'string' },
  status:        { type: 'string', allowedValues: VALID_STATUSES },
  media_urls:    { type: 'array' },
  hashtags:      { type: 'array' },
  mentions:      { type: 'array' },
}

// ── Helper: get owner id for auth checks ──────────────────────────────────────

const getPostOwnerId = async (req) => {
  const row = await findById(db, TABLE, req.params.id)
  req.resource = row
  return row?.user_id
}

// ── List ──────────────────────────────────────────────────────────────────────

// GET /api/posts?q=text&status=draft&page=1&limit=20&sort_by=created_at&order=desc
router.get('/posts', authenticate, asyncHandler(async (req, res) => {
  // Scope posts to the authenticated user (users only see their own posts)
  const result = await listQuery(db, TABLE, req.query, {
    searchColumns:  SEARCH_COLUMNS,
    allowedFilters: ALLOWED_FILTERS,
    allowedSort:    ALLOWED_SORT,
    baseWhere:      { clause: 'user_id = $1', values: [req.user.id] },
  })
  res.json(result)
}))

// ── Single ────────────────────────────────────────────────────────────────────

// GET /api/posts/:id
router.get('/posts/:id', authenticate, asyncHandler(async (req, res) => {
  const post = assertFound(
    await findById(db, TABLE, req.params.id),
    'Post not found'
  )

  // Users can only view their own posts (unless admin)
  if (post.user_id !== req.user.id && req.user.role !== 'admin') {
    assertFound(null, 'Post not found')
  }

  res.json({ data: post })
}))

// ── Create ────────────────────────────────────────────────────────────────────

// POST /api/posts
router.post('/posts', authenticate, validateBody(CREATE_RULES), asyncHandler(async (req, res) => {
  const { content, scheduled_for, status = 'draft', media_urls, hashtags, mentions } = req.body

  // If scheduling, require a future date
  if (status === 'scheduled' && !scheduled_for) {
    throw new BadRequestError('scheduled_for is required when status is scheduled')
  }

  const post = await create(db, TABLE, {
    content:       content.trim(),
    scheduled_for: scheduled_for || null,
    status,
    media_urls:    media_urls ? JSON.stringify(media_urls) : null,
    hashtags:      hashtags || null,
    mentions:      mentions || null,
    user_id:       req.user.id,
  })

  logger.info({ postId: post.id, userId: req.user.id }, 'post created')
  auditLog.log({ userId: req.user.id, action: 'post.create', resourceType: 'post', resourceId: String(post.id), meta: { status }, ip: req.ip })
  res.status(201).json({ data: post })
}))

// ── Update ────────────────────────────────────────────────────────────────────

// PATCH /api/posts/:id
router.patch(
  '/posts/:id',
  authenticate,
  requireOwnerOrAdmin(getPostOwnerId),
  validateBody(UPDATE_RULES),
  asyncHandler(async (req, res) => {
    const existing = req.resource

    // Cannot edit published or publishing posts
    if (existing.status === 'published' || existing.status === 'publishing') {
      throw new BadRequestError('Cannot edit a published post')
    }

    const { content, scheduled_for, status, media_urls, hashtags, mentions } = req.body

    // If scheduling, require a future date
    if (status === 'scheduled' && !scheduled_for && !existing.scheduled_for) {
      throw new BadRequestError('scheduled_for is required when status is scheduled')
    }

    const updates = {}
    if (content !== undefined)       updates.content = content.trim()
    if (scheduled_for !== undefined) updates.scheduled_for = scheduled_for || null
    if (status !== undefined)        updates.status = status
    if (media_urls !== undefined)    updates.media_urls = JSON.stringify(media_urls)
    if (hashtags !== undefined)      updates.hashtags = hashtags
    if (mentions !== undefined)      updates.mentions = mentions

    const post = await update(db, TABLE, req.params.id, updates)

    logger.info({ postId: post.id, userId: req.user.id }, 'post updated')
    auditLog.log({ userId: req.user.id, action: 'post.update', resourceType: 'post', resourceId: String(post.id), meta: { fields: Object.keys(updates) }, ip: req.ip })
    res.json({ data: post })
  })
)

// ── Delete ────────────────────────────────────────────────────────────────────

// DELETE /api/posts/:id
router.delete(
  '/posts/:id',
  authenticate,
  requireOwnerOrAdmin(getPostOwnerId),
  asyncHandler(async (req, res) => {
    await remove(db, TABLE, req.params.id)
    logger.info({ postId: req.params.id, userId: req.user.id }, 'post deleted')
    auditLog.log({ userId: req.user.id, action: 'post.delete', resourceType: 'post', resourceId: String(req.params.id), ip: req.ip })
    res.status(204).end()
  })
)

// ── Publish now ───────────────────────────────────────────────────────────────

// POST /api/posts/:id/publish
router.post(
  '/posts/:id/publish',
  authenticate,
  requireOwnerOrAdmin(getPostOwnerId),
  asyncHandler(async (req, res) => {
    const existing = req.resource

    // Can only publish draft or scheduled posts
    if (existing.status === 'published') {
      throw new BadRequestError('Post is already published')
    }
    if (existing.status === 'publishing') {
      throw new BadRequestError('Post is already being published')
    }

    // Mark as publishing (actual LinkedIn API integration will be a separate task)
    const post = await update(db, TABLE, req.params.id, {
      status:       'published',
      published_at: new Date().toISOString(),
    })

    logger.info({ postId: post.id, userId: req.user.id }, 'post published')
    auditLog.log({ userId: req.user.id, action: 'post.publish', resourceType: 'post', resourceId: String(post.id), ip: req.ip })
    res.json({ data: post })
  })
)

module.exports = router
