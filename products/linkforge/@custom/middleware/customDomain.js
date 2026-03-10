/**
 * Custom Domain Middleware
 * Task #10311 - Build custom short domain configuration
 * 
 * Handles routing for custom branded domains
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cache for custom domains to reduce database queries
const domainCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get custom domain from cache or database
 */
async function getCustomDomain(hostname) {
  // Check cache first
  const cached = domainCache.get(hostname);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.domain;
  }

  // Fetch from database
  try {
    const domain = await prisma.customDomain.findUnique({
      where: { 
        domain: hostname.toLowerCase(),
        status: 'verified' // Only allow verified domains
      },
      select: {
        id: true,
        domain: true,
        userId: true,
        redirectHttps: true,
        sslStatus: true,
        isDefault: true
      }
    });

    // Cache the result (even if null)
    domainCache.set(hostname, {
      domain,
      timestamp: Date.now()
    });

    return domain;
  } catch (error) {
    console.error('Error fetching custom domain:', error);
    return null;
  }
}

/**
 * Middleware to detect and handle custom domains
 * Attaches domain info to req object for downstream handlers
 */
function customDomainMiddleware() {
  return async (req, res, next) => {
    const hostname = req.hostname || req.get('host')?.split(':')[0];
    
    // Skip for localhost and primary domain
    const primaryDomain = process.env.PRIMARY_DOMAIN || 'localhost';
    if (!hostname || hostname === primaryDomain || hostname === 'localhost') {
      return next();
    }

    // Check if this is a custom domain
    const customDomain = await getCustomDomain(hostname);
    
    if (customDomain) {
      // HTTPS redirect enforcement
      if (customDomain.redirectHttps && 
          customDomain.sslStatus === 'active' && 
          req.protocol !== 'https' &&
          process.env.NODE_ENV === 'production') {
        return res.redirect(301, `https://${hostname}${req.url}`);
      }

      // Attach custom domain to request
      req.customDomain = customDomain;
    }

    next();
  };
}

/**
 * Clear domain cache (call when domains are updated)
 */
function clearDomainCache(hostname = null) {
  if (hostname) {
    domainCache.delete(hostname);
  } else {
    domainCache.clear();
  }
}

/**
 * Warm up cache by loading all verified domains
 */
async function warmUpCache() {
  try {
    const domains = await prisma.customDomain.findMany({
      where: { status: 'verified' },
      select: {
        id: true,
        domain: true,
        userId: true,
        redirectHttps: true,
        sslStatus: true,
        isDefault: true
      }
    });

    domains.forEach(domain => {
      domainCache.set(domain.domain, {
        domain,
        timestamp: Date.now()
      });
    });

    console.log(`✓ Warmed up domain cache with ${domains.length} custom domains`);
  } catch (error) {
    console.error('Error warming up domain cache:', error);
  }
}

module.exports = {
  customDomainMiddleware,
  clearDomainCache,
  warmUpCache,
  getCustomDomain
};
