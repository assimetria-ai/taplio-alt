/**
 * Brix - Templates API
 * Task #9681 - MVP: Template selection
 */

const express = require('express')
const router = express.Router()

/**
 * GET /api/templates
 * List all available templates (public endpoint)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, is_premium } = req.query
    
    let query = req.db('templates')
      .where({ is_active: true })
      .orderBy('category', 'asc')
      .orderBy('name', 'asc')
    
    if (category) {
      query = query.where('category', category)
    }
    
    if (is_premium !== undefined) {
      query = query.where('is_premium', is_premium === 'true')
    }
    
    const templates = await query
    
    res.json({ templates })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/templates/:id
 * Get template details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const template = await req.db('templates')
      .where({ id: req.params.id, is_active: true })
      .first()
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    
    res.json({ template })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/templates/:id/preview
 * Get template preview data (with sample products)
 */
router.get('/:id/preview', async (req, res, next) => {
  try {
    const template = await req.db('templates')
      .where({ id: req.params.id, is_active: true })
      .first()
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    
    // Return template with sample data
    res.json({
      template,
      sampleData: {
        storeName: 'Your Store',
        products: [
          {
            id: 'sample-1',
            name: 'Sample Product 1',
            price: 29.99,
            images: ['https://via.placeholder.com/600x600/06b6d4/ffffff?text=Product+1']
          },
          {
            id: 'sample-2',
            name: 'Sample Product 2',
            price: 39.99,
            images: ['https://via.placeholder.com/600x600/14b8a6/ffffff?text=Product+2']
          },
          {
            id: 'sample-3',
            name: 'Sample Product 3',
            price: 49.99,
            images: ['https://via.placeholder.com/600x600/f59e0b/ffffff?text=Product+3']
          }
        ]
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/templates/categories
 * Get all template categories
 */
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await req.db('templates')
      .distinct('category')
      .where({ is_active: true })
      .orderBy('category', 'asc')
    
    res.json({
      categories: categories.map(row => row.category)
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
