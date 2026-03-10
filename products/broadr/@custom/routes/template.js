// @custom/routes/template.js - Template Library API Routes

const express = require('express');
const router = express.Router();
const { TEMPLATE_TYPE, TEMPLATE_VISIBILITY, SYSTEM_TEMPLATES } = require('../models/template');

/**
 * GET /api/templates
 * List all templates (user's own + system templates)
 * Query params:
 *   - type: filter by template type
 *   - visibility: filter by visibility
 *   - tags: filter by tags (comma-separated)
 *   - category: filter by category
 *   - search: search by name or description
 */
router.get('/', async (req, res) => {
  try {
    const { type, visibility, tags, category, search } = req.query;
    const userId = req.user?.id; // Assumes auth middleware sets req.user
    
    // Build query filters
    const filters = {};
    
    if (type) filters.type = type;
    if (visibility) filters.visibility = visibility;
    if (category) filters.category = category;
    
    // In a real implementation, this would query the database
    // For now, we'll return system templates + mock user templates
    let templates = [...SYSTEM_TEMPLATES];
    
    // Add mock user templates
    if (userId) {
      templates.push({
        id: 'user_template_1',
        userId,
        name: 'Weekly Update',
        description: 'My custom weekly update template',
        type: TEMPLATE_TYPE.UPDATE,
        visibility: TEMPLATE_VISIBILITY.PRIVATE,
        content: {
          subject: 'Weekly Update: {{week_ending}}',
          body: '<h1>What happened this week</h1><p>{{content}}</p>',
          variables: [
            { name: 'week_ending', label: 'Week Ending', type: 'date', required: true },
            { name: 'content', label: 'Content', type: 'text', required: true }
          ]
        },
        channels: ['email'],
        tags: ['weekly', 'update'],
        stats: { usedCount: 12, lastUsedAt: new Date('2024-03-01') },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-01')
      });
    }
    
    // Apply filters
    if (type) {
      templates = templates.filter(t => t.type === type);
    }
    if (visibility) {
      templates = templates.filter(t => t.visibility === visibility);
    }
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim());
      templates = templates.filter(t => 
        t.tags && t.tags.some(tag => tagList.includes(tag))
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }
    
    res.json({
      templates,
      total: templates.length,
      filters: { type, visibility, tags, category, search }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find in system templates
    const template = SYSTEM_TEMPLATES.find(t => 
      t.name.toLowerCase().replace(/\s+/g, '_') === id
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * POST /api/templates
 * Create a new custom template
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const {
      name,
      description,
      type,
      visibility,
      content,
      channels,
      design,
      tags,
      category
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, type, content' 
      });
    }
    
    // Create new template
    const newTemplate = {
      id: `template_${Date.now()}`, // In production, use proper UUID
      userId,
      workspaceId: req.user.workspaceId,
      name,
      description: description || '',
      type: type || TEMPLATE_TYPE.CUSTOM,
      visibility: visibility || TEMPLATE_VISIBILITY.PRIVATE,
      content,
      channels: channels || ['email'],
      design: design || {},
      tags: tags || [],
      category: category || null,
      stats: {
        usedCount: 0,
        lastUsedAt: null,
        avgOpenRate: 0,
        avgClickRate: 0
      },
      isSystemTemplate: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    };
    
    // In production: await db.templates.create(newTemplate)
    
    res.status(201).json({
      message: 'Template created successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * PUT /api/templates/:id
 * Update an existing template
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // In production: fetch template from DB and check ownership
    // For now, just return success
    
    const updates = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: userId
    };
    
    res.json({
      message: 'Template updated successfully',
      template: { id, ...updates }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template (or archive it)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // In production: check ownership and soft-delete (archive)
    // await db.templates.update({ where: { id }, data: { isArchived: true } })
    
    res.json({
      message: 'Template deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * POST /api/templates/:id/duplicate
 * Duplicate a template (useful for customizing system templates)
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find original template
    const originalTemplate = SYSTEM_TEMPLATES.find(t => 
      t.name.toLowerCase().replace(/\s+/g, '_') === id
    );
    
    if (!originalTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Create duplicate
    const duplicate = {
      ...originalTemplate,
      id: `template_${Date.now()}`,
      userId,
      name: `${originalTemplate.name} (Copy)`,
      visibility: TEMPLATE_VISIBILITY.PRIVATE,
      isSystemTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    };
    
    res.status(201).json({
      message: 'Template duplicated successfully',
      template: duplicate
    });
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

/**
 * POST /api/templates/:id/use
 * Mark template as used (increment stats)
 */
router.post('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In production: increment usedCount and update lastUsedAt
    // await db.templates.update({
    //   where: { id },
    //   data: {
    //     stats: { usedCount: { increment: 1 }, lastUsedAt: new Date() }
    //   }
    // })
    
    res.json({
      message: 'Template usage recorded',
      id
    });
  } catch (error) {
    console.error('Error recording template usage:', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
});

/**
 * GET /api/templates/types
 * Get available template types
 */
router.get('/meta/types', (req, res) => {
  res.json({
    types: Object.values(TEMPLATE_TYPE)
  });
});

/**
 * GET /api/templates/meta/categories
 * Get available categories
 */
router.get('/meta/categories', (req, res) => {
  const categories = [...new Set(SYSTEM_TEMPLATES.map(t => t.category).filter(Boolean))];
  res.json({ categories });
});

module.exports = router;
