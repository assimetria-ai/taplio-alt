// server/routes/redirect.js - Redirect handler with analytics capture
// Task #10311 - Custom domain support

const express = require('express');
const router = express.Router();
const { captureClick } = require('../utils/analytics');
const { getGeoFromIP } = require('../utils/geo');

/**
 * GET /:slug
 * Redirect to target URL and log analytics
 * Supports both primary domain and custom domains
 */
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    // Build query based on whether this is a custom domain request
    const whereClause = { slug };
    
    // If custom domain is detected, filter links by that domain
    if (req.customDomain) {
      whereClause.domainId = req.customDomain.id;
    } else {
      // On primary domain, only show links without custom domain or with default domain
      whereClause.OR = [
        { domainId: null },
        { customDomain: { isDefault: true } }
      ];
    }

    // Find link by slug (with custom domain filtering)
    const link = await prisma.link.findFirst({
      where: whereClause,
      include: {
        customDomain: {
          select: {
            id: true,
            domain: true,
            redirectHttps: true
          }
        }
      }
    });

    if (!link) {
      // Custom 404 page for branded domains
      if (req.customDomain) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Not Found</title>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                }
                .container {
                  text-align: center;
                  padding: 2rem;
                }
                h1 { font-size: 3rem; margin: 0; }
                p { font-size: 1.25rem; opacity: 0.9; }
                .domain { opacity: 0.7; font-size: 0.875rem; margin-top: 2rem; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404</h1>
                <p>Link not found</p>
                <div class="domain">${req.customDomain.domain}</div>
              </div>
            </body>
          </html>
        `);
      }

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
