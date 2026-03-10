// server/routes/redirect.js - Redirect handler with analytics capture

const express = require('express');
const router = express.Router();
const { captureClick } = require('../utils/analytics');
const { getGeoFromIP } = require('../utils/geo');

/**
 * GET /:slug
 * Redirect to target URL and log analytics
 */
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    // Find link by slug
    const link = await prisma.link.findUnique({
      where: { slug }
    });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found',
        slug
      });
    }

    // Extract analytics data from request
    const analyticsData = {
      linkId: link.id,
      userAgent: req.headers['user-agent'] || null,
      referer: req.headers['referer'] || req.headers['referrer'] || null,
      ipAddress: req.ip || req.connection.remoteAddress || null,
      timestamp: new Date()
    };

    // Get geolocation from IP (async, don't wait for it)
    const geoData = await getGeoFromIP(analyticsData.ipAddress);
    if (geoData) {
      analyticsData.country = geoData.country;
      analyticsData.city = geoData.city;
    }

    // Capture click event (fire and forget)
    captureClick(prisma, analyticsData).catch(err => {
      console.error('Failed to capture click:', err);
    });

    // Increment click counter (fire and forget)
    prisma.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } }
    }).catch(err => {
      console.error('Failed to increment click count:', err);
    });

    // Redirect to target URL
    res.redirect(302, link.targetUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
