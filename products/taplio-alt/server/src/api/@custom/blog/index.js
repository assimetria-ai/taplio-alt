// @custom — blog API
// GET    /api/blog                — list published posts (paginated + searchable)
// GET    /api/blog/:slug          — get single post by slug
// POST   /api/blog                — create post (admin only)
// PATCH  /api/blog/:id            — update post (admin only)
// DELETE /api/blog/:id            — delete post (admin only)
const express    = require('express')
const sanitizeHtml = require('sanitize-html')
const router     = express.Router()
const db         = require('../../../lib/@system/PostgreSQL')
const logger     = require('../../../lib/@system/Logger')
const { validateBody } = require('../../../lib/@system/Middleware/validate')
const {
  authenticate,
  requireAdmin,
  parsePagination,
  paginationMeta,
  parseSortBy,
  parseSearch,
  buildWhereClause,
  findById,
  findAll,
  countAll,
  create,
  update,
  remove,
} = require('../../../lib/@system/Helpers')

// ── Config ────────────────────────────────────────────────────────────────────

const TABLE          = 'blog_posts'
const SEARCH_COLUMNS = ['title', 'excerpt']
const ALLOWED_SORT   = ['title', 'published_at', 'created_at', 'updated_at']

// Whitelist of safe HTML tags and attributes for blog content.
// Strips <script>, inline event handlers (onclick, onerror, etc.), and all
// javascript: hrefs to prevent stored XSS.
const SANITIZE_OPTIONS = {
  allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'br', 'blockquote', 'code', 'pre'],
  allowedAttributes: {
    a:   ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes:      ['https', 'http', 'mailto'],
  allowedSchemesByTag: {
    a:   ['https', 'http', 'mailto'],
    img: ['https', 'http'],
  },
  // Force rel="noopener noreferrer" on external links
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: 'noopener noreferrer' },
    }),
  },
}

function sanitizeContent(raw) {
  return sanitizeHtml(raw, SANITIZE_OPTIONS)
}

function sanitizeExcerpt(raw) {
  return sanitizeHtml(raw, { allowedTags: [], allowedAttributes: {} })
}

// ── Validation rules ──────────────────────────────────────────────────────────

const CREATE_RULES = {
  title:        { required: true,  type: 'string', maxLength: 300 },
  slug:         { required: true,  type: 'string', maxLength: 300, pattern: /^[a-z0-9-]+$/ },
  content:      { required: true,  type: 'string' },
  excerpt:      { type: 'string',  maxLength: 1000 },
  published_at: { type: 'string' },
}

const UPDATE_RULES = {
  title:        { type: 'string', maxLength: 300 },
  slug:         { type: 'string', maxLength: 300, pattern: /^[a-z0-9-]+$/ },
  content:      { type: 'string' },
  excerpt:      { type: 'string', maxLength: 1000 },
  published_at: { type: 'string' },
}

// ── List ──────────────────────────────────────────────────────────────────────

// GET /api/blog?q=text&page=1&limit=20&sort_by=published_at&order=desc
router.get('/blog', async (req, res, next) => {
  try {
    const { limit, offset }     = parsePagination(req.query)
    const { orderBy }           = parseSortBy(req.query, ALLOWED_SORT, { default: 'published_at' })
    const { term }              = parseSearch(req.query)

    // Only surface published posts — add the constraint before search/filter params
    const publishedFilter = 'published_at IS NOT NULL AND published_at <= now()'
    const { where: searchWhere, params: searchParams } = buildWhereClause({
      term, columns: SEARCH_COLUMNS,
    })

    const where  = searchWhere
      ? `WHERE ${publishedFilter} AND ${searchWhere.replace(/^WHERE /i, '')}`
      : `WHERE ${publishedFilter}`

    const [total, rows] = await Promise.all([
      countAll(db, TABLE, { where, params: searchParams }),
      findAll(db, TABLE, {
        where,
        params:  searchParams,
        orderBy,
        limit,
        offset,
        columns: 'id, slug, title, excerpt, author_id, published_at, created_at, updated_at',
      }),
    ])

    res.json({ data: rows, meta: paginationMeta(total, limit, offset) })
  } catch (err) {
    next(err)
  }
})

// ── Single post ───────────────────────────────────────────────────────────────

// GET /api/blog/:slug
router.get('/blog/:slug', async (req, res, next) => {
  try {
    const post = await db.oneOrNone(
      `SELECT * FROM ${TABLE} WHERE slug = $1 AND published_at IS NOT NULL AND published_at <= now()`,
      [req.params.slug]
    )
    if (!post) return res.status(404).json({ message: 'Post not found' })
    res.json({ data: post })
  } catch (err) {
    next(err)
  }
})

// ── Create ────────────────────────────────────────────────────────────────────

// POST /api/blog
router.post('/blog', authenticate, requireAdmin, validateBody(CREATE_RULES), async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, published_at } = req.body

    const post = await create(db, TABLE, {
      title:        title.trim(),
      slug:         slug.trim(),
      excerpt:      excerpt ? sanitizeExcerpt(excerpt) : null,
      content:      sanitizeContent(content),
      author_id:    req.user.id,
      published_at: published_at ?? null,
    })

    logger.info({ postId: post.id, authorId: req.user.id }, 'blog post created')
    res.status(201).json({ data: post })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Slug already in use' })
    next(err)
  }
})

// ── Update ────────────────────────────────────────────────────────────────────

// PATCH /api/blog/:id
router.patch('/blog/:id', authenticate, requireAdmin, validateBody(UPDATE_RULES), async (req, res, next) => {
  try {
    const existing = await findById(db, TABLE, req.params.id)
    if (!existing) return res.status(404).json({ message: 'Post not found' })

    const { title, slug, excerpt, content, published_at } = req.body

    const post = await update(db, TABLE, req.params.id, {
      title:        title        !== undefined ? title.trim()              : undefined,
      slug:         slug         !== undefined ? slug.trim()               : undefined,
      excerpt:      excerpt      !== undefined ? sanitizeExcerpt(excerpt)  : undefined,
      content:      content      !== undefined ? sanitizeContent(content)  : undefined,
      published_at: published_at !== undefined ? published_at              : undefined,
    })

    logger.info({ postId: post.id, authorId: req.user.id }, 'blog post updated')
    res.json({ data: post })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Slug already in use' })
    next(err)
  }
})

// ── Delete ────────────────────────────────────────────────────────────────────

// DELETE /api/blog/:id
router.delete('/blog/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await remove(db, TABLE, req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Post not found' })
    logger.info({ postId: req.params.id, authorId: req.user.id }, 'blog post deleted')
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

module.exports = router
