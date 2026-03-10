// server/routes/conversions.js - Conversion tracking endpoint

const express = require('express');
const router = express.Router();
const { trackConversion } = require('../utils/analytics');
const { getGeoFromIP } = require('../utils/geo');

/**
 * POST /api/conversions
 * Track a conversion event from the target page
 * 
 * Body:
 * {
 *   "linkId": "abc123",
 *   "conversionType": "purchase",
 *   "value": 29.99,
 *   "extra": { "productId": "prod_123" }
 * }
 */
router.post('/conversions', async (req, res) => {
  const { linkId, conversionType, value, extra } = req.body;
  const prisma = req.app.locals.prisma;

  if (!linkId || !conversionType) {
    return res.status(400).json({
      error: 'Missing required fields: linkId, conversionType'
    });
  }

  try {
    // Verify link exists
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return res.status(404).json({
        error: 'Link not found'
      });
    }

    // Extract request data
    const ipAddress = req.ip || req.connection.remoteAddress;
    const geoData = await getGeoFromIP(ipAddress);

    // Track conversion
    const conversion = await trackConversion(prisma, linkId, conversionType, {
      value,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'] || req.headers['referrer'],
      ipAddress,
      country: geoData?.country,
      city: geoData?.city,
      extra
    });

    res.json({
      success: true,
      conversion: {
        id: conversion.id,
        linkId: conversion.linkId,
        conversionType: conversion.conversionType,
        value: conversion.conversionValue,
        timestamp: conversion.createdAt
      }
    });

  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({
      error: 'Failed to track conversion'
    });
  }
});

/**
 * GET /api/conversions/:linkId
 * Get conversion data for a link
 */
router.get('/conversions/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    const [conversions, totalConversions, totalValue] = await Promise.all([
      prisma.clickEvent.findMany({
        where: { 
          linkId,
          isConversion: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.clickEvent.count({
        where: { 
          linkId,
          isConversion: true
        }
      }),
      prisma.clickEvent.aggregate({
        where: { 
          linkId,
          isConversion: true,
          conversionValue: { not: null }
        },
        _sum: { conversionValue: true }
      })
    ]);

    res.json({
      linkId,
      totalConversions,
      totalValue: totalValue._sum.conversionValue || 0,
      conversions
    });

  } catch (error) {
    console.error('Conversion query error:', error);
    res.status(500).json({
      error: 'Failed to fetch conversions'
    });
  }
});

module.exports = router;
