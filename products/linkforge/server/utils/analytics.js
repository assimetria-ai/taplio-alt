// server/utils/analytics.js - Analytics capture utilities

/**
 * Capture click event to database
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {Object} data - Click event data
 * @param {string} data.linkId - Link ID
 * @param {string} data.userAgent - User agent string
 * @param {string} data.referer - Referrer URL
 * @param {string} data.ipAddress - Visitor IP address
 * @param {string} data.country - Country from geo lookup
 * @param {string} data.city - City from geo lookup
 * @param {Date} data.timestamp - Click timestamp
 * @returns {Promise<Object>} Created click event
 */
async function captureClick(prisma, data) {
  try {
    const clickEvent = await prisma.clickEvent.create({
      data: {
        linkId: data.linkId,
        userAgent: data.userAgent,
        referer: data.referer,
        ipAddress: data.ipAddress,
        country: data.country || null,
        city: data.city || null,
        createdAt: data.timestamp
      }
    });

    return clickEvent;
  } catch (error) {
    console.error('Error capturing click event:', error);
    throw error;
  }
}

/**
 * Get analytics summary for a link
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} linkId - Link ID
 * @returns {Promise<Object>} Analytics summary
 */
async function getAnalyticsSummary(prisma, linkId) {
  const [link, totalClicks, clicksByCountry, clicksByReferer, recentClicks] = await Promise.all([
    prisma.link.findUnique({ where: { id: linkId } }),
    prisma.clickEvent.count({ where: { linkId } }),
    prisma.clickEvent.groupBy({
      by: ['country'],
      where: { linkId, country: { not: null } },
      _count: { country: true }
    }),
    prisma.clickEvent.groupBy({
      by: ['referer'],
      where: { linkId, referer: { not: null } },
      _count: { referer: true }
    }),
    prisma.clickEvent.findMany({
      where: { linkId },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  ]);

  return {
    link,
    totalClicks,
    clicksByCountry: clicksByCountry.map(c => ({
      country: c.country,
      count: c._count.country
    })),
    clicksByReferer: clicksByReferer.map(r => ({
      referer: r.referer,
      count: r._count.referer
    })),
    recentClicks
  };
}

/**
 * Track conversion event (e.g., purchase, signup)
 * This can be called via a webhook or tracking pixel on the target page
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} linkId - Link ID
 * @param {string} conversionType - Type of conversion (e.g., 'purchase', 'signup')
 * @param {Object} metadata - Additional conversion data
 * @param {number} metadata.value - Monetary value of conversion
 * @param {string} metadata.userAgent - User agent string
 * @param {string} metadata.referer - Referrer URL
 * @param {string} metadata.ipAddress - Visitor IP address
 * @param {string} metadata.country - Country from geo lookup
 * @param {string} metadata.city - City from geo lookup
 * @returns {Promise<Object>} Conversion record
 */
async function trackConversion(prisma, linkId, conversionType, metadata = {}) {
  try {
    const conversionEvent = await prisma.clickEvent.create({
      data: {
        linkId,
        userAgent: metadata.userAgent || 'conversion-tracker',
        referer: metadata.referer || null,
        ipAddress: metadata.ipAddress || null,
        country: metadata.country || null,
        city: metadata.city || null,
        isConversion: true,
        conversionType,
        conversionValue: metadata.value || null,
        metadata: metadata.extra || {}
      }
    });

    return conversionEvent;
  } catch (error) {
    console.error('Error tracking conversion:', error);
    throw error;
  }
}

module.exports = {
  captureClick,
  getAnalyticsSummary,
  trackConversion
};
