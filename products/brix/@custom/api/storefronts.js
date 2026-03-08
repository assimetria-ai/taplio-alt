/**
 * Brix - Storefronts API
 * Task #9681 - MVP: Storefront template selection and management
 */

const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../@system/middleware/auth')
const { validateBody } = require('../../@system/middleware/validation')

// Validation schemas
const createStorefrontSchema = {
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  template_id: { type: 'string', required: true },
  custom_domain: { type: 'string', required: false },
  settings: { type: 'object', required: false, default: {} },
  blocks: { type: 'array', required: false, default: [] },
}

/**
 * GET /api/storefronts
 * List user's storefronts
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    const userId = req.user.id
    
    let query = req.db('storefronts')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
    
    if (status) {
      query = query.where('status', status)
    }
    
    const storefronts = await query
    
    // Get total count
    let countQuery = req.db('storefronts').where({ user_id: userId })
    if (status) countQuery = countQuery.where('status', status)
    const [{ count }] = await countQuery.count('* as count')
    
    res.json({
      storefronts,
      pagination: {
        total: parseInt(count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/storefronts
 * Create a new storefront
 */
router.post('/', requireAuth, validateBody(createStorefrontSchema), async (req, res, next) => {
  try {
    const userId = req.user.id
    const { name, template_id, custom_domain, settings, blocks } = req.body
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Check for duplicate slug
    const existing = await req.db('storefronts')
      .where({ slug })
      .first()
    
    if (existing) {
      return res.status(400).json({
        error: 'A storefront with this name already exists'
      })
    }
    
    // Verify template exists
    const template = await req.db('templates')
      .where({ id: template_id, is_active: true })
      .first()
    
    if (!template) {
      return res.status(400).json({ error: 'Invalid template' })
    }
    
    // Use template defaults if not provided
    const finalSettings = settings || template.default_settings
    const finalBlocks = blocks || template.default_blocks
    
    // Insert storefront
    const [storefront] = await req.db('storefronts')
      .insert({
        user_id: userId,
        name,
        slug,
        template_id,
        custom_domain,
        settings: finalSettings,
        blocks: finalBlocks,
        status: 'draft'
      })
      .returning('*')
    
    res.status(201).json({ storefront })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/storefronts/:id
 * Get storefront details
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const storefront = await req.db('storefronts')
      .where({ id: req.params.id, user_id: req.user.id })
      .first()
    
    if (!storefront) {
      return res.status(404).json({ error: 'Storefront not found' })
    }
    
    // Include template info
    const template = await req.db('templates')
      .where({ id: storefront.template_id })
      .first()
    
    res.json({
      storefront,
      template
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PATCH /api/storefronts/:id
 * Update storefront
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updates = req.body
    
    // Check ownership
    const storefront = await req.db('storefronts')
      .where({ id, user_id: userId })
      .first()
    
    if (!storefront) {
      return res.status(404).json({ error: 'Storefront not found' })
    }
    
    // Update slug if name changed
    if (updates.name && updates.name !== storefront.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Check for slug collision
      const existing = await req.db('storefronts')
        .where({ slug: updates.slug })
        .whereNot({ id })
        .first()
      
      if (existing) {
        return res.status(400).json({
          error: 'A storefront with this name already exists'
        })
      }
    }
    
    // Perform update
    const [updated] = await req.db('storefronts')
      .where({ id, user_id: userId })
      .update({
        ...updates,
        updated_at: req.db.fn.now()
      })
      .returning('*')
    
    res.json({ storefront: updated })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/storefronts/:id/publish
 * Publish storefront (make live)
 */
router.post('/:id/publish', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // Check ownership
    const storefront = await req.db('storefronts')
      .where({ id, user_id: userId })
      .first()
    
    if (!storefront) {
      return res.status(404).json({ error: 'Storefront not found' })
    }
    
    // Publish
    const [published] = await req.db('storefronts')
      .where({ id, user_id: userId })
      .update({
        status: 'published',
        published_at: req.db.fn.now(),
        updated_at: req.db.fn.now()
      })
      .returning('*')
    
    res.json({
      message: 'Storefront published',
      storefront: published,
      url: `${process.env.APP_URL}/${published.slug}`
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/storefronts/:id
 * Delete storefront (soft delete by archiving)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // Archive instead of delete
    const [storefront] = await req.db('storefronts')
      .where({ id, user_id: userId })
      .update({
        status: 'archived',
        updated_at: req.db.fn.now()
      })
      .returning('*')
    
    if (!storefront) {
      return res.status(404).json({ error: 'Storefront not found' })
    }
    
    res.json({ message: 'Storefront archived', storefront })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/storefronts/:id/preview
 * Get storefront preview data
 */
router.get('/:id/preview', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    const storefront = await req.db('storefronts')
      .where({ id, user_id: userId })
      .first()
    
    if (!storefront) {
      return res.status(404).json({ error: 'Storefront not found' })
    }
    
    // Get all active products for preview
    const products = await req.db('products')
      .where({ user_id: userId, status: 'active' })
      .orderBy('created_at', 'desc')
    
    res.json({
      storefront,
      products
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
