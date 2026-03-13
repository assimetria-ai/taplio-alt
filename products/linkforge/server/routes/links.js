// server/routes/links.js - Links Management API
// Task #10278 - Dashboard Links List UI

const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;

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

    // Add hasPassword flag and remove hash from response
    const safeLinks = links.map(link => {
      const { passwordHash, ...rest } = link;
      return { ...rest, hasPassword: !!passwordHash };
    });

    res.json({ links: safeLinks });
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
    const { targetUrl, slug, domainId, password } = req.body;

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

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    // Create link
    const link = await prisma.link.create({
      data: {
        slug: finalSlug,
        targetUrl,
        userId,
        domainId: domainId || null,
        passwordHash
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

    // Don't expose password hash in response
    const hasPassword = !!link.passwordHash;
    delete link.passwordHash;

    res.status(201).json({ link: { ...link, hasPassword } });
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

    // Don't expose password hash
    const { passwordHash, ...safeLink } = link;
    res.json({ link: { ...safeLink, hasPassword: !!passwordHash } });
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
    const { targetUrl, slug, domainId, password, removePassword } = req.body;

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

    // Handle password changes
    let passwordHash = undefined; // undefined = no change
    if (removePassword) {
      passwordHash = null; // Remove password
    } else if (password) {
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    // Update link
    const updated = await prisma.link.update({
      where: { id },
      data: {
        ...(targetUrl && { targetUrl }),
        ...(slug && { slug }),
        ...(domainId !== undefined && { domainId }),
        ...(passwordHash !== undefined && { passwordHash })
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

    // Don't expose password hash
    const { passwordHash: _, ...safeUpdated } = updated;
    res.json({ link: { ...safeUpdated, hasPassword: !!updated.passwordHash } });
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

/**
 * GET /api/links/:id/password-attempts
 * Get password attempt history for a link (for link owner)
 */
router.get('/:id/password-attempts', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { id } = req.params;

    const link = await prisma.link.findUnique({
      where: { id }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (!link.passwordHash) {
      return res.status(400).json({ error: 'Link is not password protected' });
    }

    // TODO: Check if user owns this link

    const attempts = await prisma.passwordAttempt.findMany({
      where: { linkId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        ipAddress: true,
        success: true,
        createdAt: true
      }
    });

    // Aggregate stats
    const totalAttempts = attempts.length;
    const failedAttempts = attempts.filter(a => !a.success).length;
    const successfulAttempts = attempts.filter(a => a.success).length;

    // Unique IPs with failed attempts
    const failedIPs = [...new Set(
      attempts.filter(a => !a.success).map(a => a.ipAddress)
    )];

    res.json({
      linkId: id,
      stats: {
        totalAttempts,
        failedAttempts,
        successfulAttempts,
        uniqueFailedIPs: failedIPs.length
      },
      attempts,
      rateLimitedIPs: failedIPs
    });
  } catch (error) {
    console.error('Error fetching password attempts:', error);
    res.status(500).json({ error: 'Failed to fetch password attempts' });
  }
});

module.exports = router;
