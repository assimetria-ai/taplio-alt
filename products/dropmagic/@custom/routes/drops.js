// routes/drops.js - Drop Management API Routes

const express = require('express');
const router = express.Router();
const Drop = require('../models/drop');
const { authenticateUser } = require('../../@system/middleware/auth'); // Assuming auth middleware exists
const { validateDrop, validateDropUpdate } = require('../services/validation');

/**
 * GET /api/drops
 * List all drops (filtered by access)
 */
router.get('/', async (req, res) => {
  try {
    const { status, isPublic, limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }

    // If not authenticated, only show public drops
    if (!userId) {
      query.isPublic = true;
      query.status = 'live';
    } else if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // If authenticated, show user's own drops or public drops
    if (userId) {
      query.$or = [
        { userId },
        { isPublic: true, status: 'live' }
      ];
    }

    const drops = await Drop.find(query)
      .sort({ scheduledAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('product.fileIds', 'name size mimeType')
      .lean();

    const total = await Drop.countDocuments(query);

    res.json({
      drops,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + drops.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ error: 'Failed to fetch drops' });
  }
});

/**
 * GET /api/drops/:id
 * Get a specific drop by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const drop = await Drop.findById(id)
      .populate('product.fileIds', 'name size mimeType url');

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check access
    const isOwner = userId && drop.userId.toString() === userId;
    const hasAccess = isOwner || drop.hasAccess(userEmail);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ drop });
  } catch (error) {
    console.error('Error fetching drop:', error);
    res.status(500).json({ error: 'Failed to fetch drop' });
  }
});

/**
 * GET /api/drops/slug/:slug
 * Get a drop by slug
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const drop = await Drop.findOne({ slug })
      .populate('product.fileIds', 'name size mimeType url');

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check access
    const isOwner = userId && drop.userId.toString() === userId;
    const hasAccess = isOwner || drop.hasAccess(userEmail);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ drop });
  } catch (error) {
    console.error('Error fetching drop:', error);
    res.status(500).json({ error: 'Failed to fetch drop' });
  }
});

/**
 * POST /api/drops
 * Create a new drop (requires authentication)
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const dropData = req.body;

    // Validate input
    const validation = validateDrop(dropData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Create drop
    const drop = new Drop({
      ...dropData,
      userId,
      status: 'draft'
    });

    await drop.save();

    res.status(201).json({ 
      drop,
      message: 'Drop created successfully'
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    
    res.status(500).json({ error: 'Failed to create drop' });
  }
});

/**
 * PATCH /api/drops/:id
 * Update a drop (requires authentication and ownership)
 */
router.patch('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const drop = await Drop.findById(id);

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check ownership
    if (drop.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate updates
    const validation = validateDropUpdate(updates);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Prevent certain changes after going live
    if (drop.status === 'live') {
      const restrictedFields = ['scheduledAt', 'product.fileIds'];
      const hasRestrictedChanges = restrictedFields.some(field => 
        updates[field] !== undefined
      );

      if (hasRestrictedChanges) {
        return res.status(400).json({ 
          error: 'Cannot modify scheduled time or files after drop is live' 
        });
      }
    }

    // Apply updates
    Object.assign(drop, updates);
    await drop.save();

    res.json({ 
      drop,
      message: 'Drop updated successfully'
    });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({ error: 'Failed to update drop' });
  }
});

/**
 * DELETE /api/drops/:id
 * Delete a drop (requires authentication and ownership)
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const drop = await Drop.findById(id);

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check ownership
    if (drop.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Prevent deletion of live drops
    if (drop.status === 'live') {
      return res.status(400).json({ 
        error: 'Cannot delete a live drop. Cancel it first.' 
      });
    }

    await drop.deleteOne();

    res.json({ message: 'Drop deleted successfully' });
  } catch (error) {
    console.error('Error deleting drop:', error);
    res.status(500).json({ error: 'Failed to delete drop' });
  }
});

/**
 * POST /api/drops/:id/schedule
 * Schedule a draft drop (requires authentication and ownership)
 */
router.post('/:id/schedule', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const drop = await Drop.findById(id);

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check ownership
    if (drop.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check status
    if (drop.status !== 'draft') {
      return res.status(400).json({ 
        error: 'Only draft drops can be scheduled' 
      });
    }

    // Validate that scheduledAt is in the future
    if (drop.scheduledAt <= new Date()) {
      return res.status(400).json({ 
        error: 'Scheduled time must be in the future' 
      });
    }

    drop.status = 'scheduled';
    await drop.save();

    res.json({ 
      drop,
      message: 'Drop scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling drop:', error);
    res.status(500).json({ error: 'Failed to schedule drop' });
  }
});

/**
 * POST /api/drops/:id/cancel
 * Cancel a scheduled drop (requires authentication and ownership)
 */
router.post('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const drop = await Drop.findById(id);

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check ownership
    if (drop.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check status
    if (!['scheduled', 'live'].includes(drop.status)) {
      return res.status(400).json({ 
        error: 'Can only cancel scheduled or live drops' 
      });
    }

    drop.status = 'cancelled';
    await drop.save();

    res.json({ 
      drop,
      message: 'Drop cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling drop:', error);
    res.status(500).json({ error: 'Failed to cancel drop' });
  }
});

/**
 * POST /api/drops/:id/download
 * Track download and provide access (requires access permission)
 */
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const drop = await Drop.findById(id)
      .populate('product.fileIds', 'name size mimeType url downloadUrl');

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found' });
    }

    // Check if drop is active
    if (!drop.isActive) {
      return res.status(400).json({ error: 'Drop is not currently active' });
    }

    // Check access
    const isOwner = userId && drop.userId.toString() === userId;
    const hasAccess = isOwner || drop.hasAccess(userEmail);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check download limit
    if (drop.isDownloadLimitReached) {
      return res.status(429).json({ error: 'Download limit reached' });
    }

    // Increment download count
    await drop.incrementDownload();

    res.json({ 
      files: drop.product.fileIds,
      message: 'Download authorized'
    });
  } catch (error) {
    console.error('Error processing download:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
});

module.exports = router;
