// server/routes/links.js - Links Management API
// Task #10278 - Dashboard Links List UI

const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');

/**
 * GET /api/links
 * Get all links for the authenticated user
 */
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    // TODO: Add authentication middleware
    const userId = req.user?.id || null;

    const whereClause = userId ? { userId } : {};

    const links = await prisma.link.findMany({
      where: whereClause,
      include: {
        customDomain: {
          select: {
            id: true,
            domain: true,
            sslStatus: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

/**
 * POST /api/links
 * Create a new short link
 */
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { targetUrl, slug, domainId } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'targetUrl is required' });
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid target URL' });
    }

    // Generate slug if not provided
    const finalSlug = slug || nanoid(6);

    // Check if slug already exists
    const existing = await prisma.link.findUnique({
      where: { slug: finalSlug }
    });

    if (existing) {
      return res.status(409).json({ 
        error: 'Slug already exists',
        suggestion: nanoid(6)
      });
    }

    // TODO: Add authentication
    const userId = req.user?.id || null;

    // Create link
    const link = await prisma.link.create({
      data: {
        slug: finalSlug,
        targetUrl,
        userId,
        domainId: domainId || null
      },
      include: {
        customDomain: {
          select: {
            id: true,
            domain: true,
            sslStatus: true
          }
        }
      }
    });

    res.status(201).json({ link });
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

/**
 * GET /api/links/:id
 * Get link details
 */
router.get('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({
      where: { id },
      include: {
        customDomain: {
          select: {
            id: true,
            domain: true,
            sslStatus: true
          }
        },
        clickEvents: {
          take: 100,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // TODO: Check if user owns this link

    res.json({ link });
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
});

/**
 * PUT /api/links/:id
 * Update link
 */
router.put('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { id } = req.params;
    const { targetUrl, slug, domainId } = req.body;

    const link = await prisma.link.findUnique({
      where: { id }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // TODO: Check if user owns this link

    // If slug is being changed, check if new slug is available
    if (slug && slug !== link.slug) {
      const existing = await prisma.link.findUnique({
        where: { slug }
      });

      if (existing) {
        return res.status(409).json({ error: 'Slug already exists' });
      }
    }

    // Validate target URL if provided
    if (targetUrl) {
      try {
        new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid target URL' });
      }
    }

    // Update link
    const updated = await prisma.link.update({
      where: { id },
      data: {
        ...(targetUrl && { targetUrl }),
        ...(slug && { slug }),
        ...(domainId !== undefined && { domainId })
      },
      include: {
        customDomain: {
          select: {
            id: true,
            domain: true,
            sslStatus: true
          }
        }
      }
    });

    res.json({ link: updated });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

/**
 * DELETE /api/links/:id
 * Delete link
 */
router.delete('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({
      where: { id }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // TODO: Check if user owns this link

    await prisma.link.delete({
      where: { id }
    });

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

/**
 * GET /api/links/:id/analytics
 * Get link analytics
 */
router.get('/:id/analytics', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({
      where: { id }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Get click events with aggregations
    const clickEvents = await prisma.clickEvent.findMany({
      where: { linkId: id },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    // Aggregate by country
    const byCountry = clickEvents.reduce((acc, event) => {
      const country = event.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Aggregate by date
    const byDate = clickEvents.reduce((acc, event) => {
      const date = event.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Aggregate by referrer
    const byReferrer = clickEvents.reduce((acc, event) => {
      const referrer = event.referer || 'Direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {});

    res.json({
      link,
      analytics: {
        totalClicks: link.clicks,
        byCountry,
        byDate,
        byReferrer,
        recentEvents: clickEvents.slice(0, 100)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
