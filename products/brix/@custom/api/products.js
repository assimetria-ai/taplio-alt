/**
 * Brix - Products API
 * Task #9681 - MVP: Product catalog creation
 */

const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../@system/middleware/auth')
const { validateBody } = require('../../@system/middleware/validation')

// Validation schemas
const createProductSchema = {
  name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  description: { type: 'string', required: false },
  price: { type: 'number', required: true, min: 0 },
  images: { type: 'array', required: false, default: [] },
  sku: { type: 'string', required: false },
  inventory: { type: 'number', required: false, default: 0 },
  variants: { type: 'array', required: false, default: [] },
  categories: { type: 'array', required: false, default: [] },
  tags: { type: 'array', required: false, default: [] },
  status: { type: 'string', enum: ['draft', 'active', 'archived'], default: 'draft' }
}

/**
 * GET /api/products
 * List user's products with optional filters
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, search, category, limit = 50, offset = 0 } = req.query
    const userId = req.user.id
    
    let query = req.db('products')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
    
    // Filter by status
    if (status) {
      query = query.where('status', status)
    }
    
    // Search by name/description
    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`)
      })
    }
    
    // Filter by category (JSONB contains)
    if (category) {
      query = query.whereRaw('categories @> ?', [JSON.stringify([category])])
    }
    
    const products = await query
    
    // Get total count
    let countQuery = req.db('products').where({ user_id: userId })
    if (status) countQuery = countQuery.where('status', status)
    const [{ count }] = await countQuery.count('* as count')
    
    res.json({
      products,
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
 * POST /api/products
 * Create a new product
 */
router.post('/', requireAuth, validateBody(createProductSchema), async (req, res, next) => {
  try {
    const userId = req.user.id
    const data = req.body
    
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Check for duplicate slug
    const existing = await req.db('products')
      .where({ user_id: userId, slug })
      .first()
    
    if (existing) {
      return res.status(400).json({
        error: 'A product with this name already exists'
      })
    }
    
    // Insert product
    const [product] = await req.db('products')
      .insert({
        user_id: userId,
        slug,
        ...data
      })
      .returning('*')
    
    res.status(201).json({ product })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/products/:id
 * Get product details
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const product = await req.db('products')
      .where({ id: req.params.id, user_id: req.user.id })
      .first()
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json({ product })
  } catch (error) {
    next(error)
  }
})

/**
 * PATCH /api/products/:id
 * Update product
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updates = req.body
    
    // Check ownership
    const product = await req.db('products')
      .where({ id, user_id: userId })
      .first()
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Update slug if name changed
    if (updates.name && updates.name !== product.name) {
      updates.slug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // Perform update
    const [updated] = await req.db('products')
      .where({ id, user_id: userId })
      .update({
        ...updates,
        updated_at: req.db.fn.now()
      })
      .returning('*')
    
    res.json({ product: updated })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/products/:id
 * Delete product (soft delete by archiving)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    
    // Archive instead of delete
    const [product] = await req.db('products')
      .where({ id, user_id: userId })
      .update({
        status: 'archived',
        updated_at: req.db.fn.now()
      })
      .returning('*')
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json({ message: 'Product archived', product })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/products/stats
 * Get product statistics
 */
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id
    
    const [stats] = await req.db('products')
      .where({ user_id: userId })
      .select([
        req.db.raw("COUNT(*) FILTER (WHERE status = 'active') as active_count"),
        req.db.raw("COUNT(*) FILTER (WHERE status = 'draft') as draft_count"),
        req.db.raw('COUNT(*) as total_count'),
        req.db.raw('SUM(inventory) as total_inventory'),
        req.db.raw('AVG(price) as avg_price')
      ])
    
    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

module.exports = router
