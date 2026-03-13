// server/routes/redirect.js - Redirect handler with analytics capture
// Task #10311 - Custom domain support
// Task #10670 - Password protection for links

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { captureClick } = require('../utils/analytics');
const { getGeoFromIP } = require('../utils/geo');
const { escapeHtml } = require('../utils/sanitize');
const { hashIP } = require('../utils/ipAnonymizer');

// Rate limit: max failed attempts per IP per link in a time window
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate the password prompt HTML page
 */
function passwordPromptPage(slug, error = null, domain = null) {
  const errorHtml = error 
    ? `<div class="error">${error}</div>` 
    : '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Required</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8fafc;
      color: #1e293b;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 400px;
      margin: 1rem;
    }
    .icon {
      width: 48px;
      height: 48px;
      background: #3A8BFD;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    .icon svg { width: 24px; height: 24px; color: white; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .error {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      border: 1px solid #fecaca;
    }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #475569; }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="password"]:focus { border-color: #3A8BFD; box-shadow: 0 0 0 3px rgba(58, 139, 253, 0.1); }
    button {
      background: #3A8BFD;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #2563eb; }
    button:active { background: #1d4ed8; }
    .domain-label { color: #94a3b8; font-size: 0.75rem; text-align: center; margin-top: 1.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    </div>
    <h1>This link is password protected</h1>
    <p>Enter the password to continue to your destination.</p>
    ${errorHtml}
    <form method="POST" action="/${slug}/unlock">
      <div>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter password" required autofocus />
      </div>
      <button type="submit">Continue</button>
    </form>
    ${domain ? `<div class="domain-label">${escapeHtml(domain)}</div>` : ''}
  </div>
</body>
</html>`;
}

/**
 * Check if IP is rate-limited for a specific link
 */
async function isRateLimited(prisma, linkId, ipAddress) {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  
  const failedAttempts = await prisma.passwordAttempt.count({
    where: {
      linkId,
      ipAddress,
      success: false,
      createdAt: { gte: windowStart }
    }
  });

  return failedAttempts >= MAX_FAILED_ATTEMPTS;
}

/**
 * Log a password attempt
 */
async function logPasswordAttempt(prisma, linkId, ipAddress, success) {
  try {
    await prisma.passwordAttempt.create({
      data: { linkId, ipAddress, success }
    });
  } catch (err) {
    console.error('Failed to log password attempt:', err);
  }
}

/**
 * Find a link by slug with optional domain filtering
 */
async function findLink(prisma, slug, customDomain) {
  const whereClause = { slug };

  if (customDomain) {
    whereClause.domainId = customDomain.id;
  } else {
    whereClause.OR = [
      { domainId: null },
      { customDomain: { isDefault: true } }
    ];
  }

  return prisma.link.findFirst({
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
}

/**
 * Perform redirect with analytics tracking
 */
async function performRedirect(req, res, prisma, link) {
  const rawIP = req.ip || req.connection.remoteAddress || null;
  const analyticsData = {
    linkId: link.id,
    userAgent: req.headers['user-agent'] || null,
    referer: req.headers['referer'] || req.headers['referrer'] || null,
    ipAddress: rawIP, // will be truncated by captureClick/analytics.js
    timestamp: new Date()
  };

  const geoData = await getGeoFromIP(rawIP); // geo lookup uses raw IP (not stored)
  if (geoData) {
    analyticsData.country = geoData.country;
    analyticsData.city = geoData.city;
  }

  captureClick(prisma, analyticsData).catch(err => {
    console.error('Failed to capture click:', err);
  });

  prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } }
  }).catch(err => {
    console.error('Failed to increment click count:', err);
  });

  res.redirect(302, link.targetUrl);
}

/**
 * Render 404 page
 */
function render404(req, res, slug) {
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
            .container { text-align: center; padding: 2rem; }
            h1 { font-size: 3rem; margin: 0; }
            p { font-size: 1.25rem; opacity: 0.9; }
            .domain { opacity: 0.7; font-size: 0.875rem; margin-top: 2rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404</h1>
            <p>Link not found</p>
            <div class="domain">${escapeHtml(req.customDomain.domain)}</div>
          </div>
        </body>
      </html>
    `);
  }

  return res.status(404).json({ error: 'Link not found', slug });
}

/**
 * POST /:slug/unlock
 * Verify password for protected links
 */
router.post('/:slug/unlock', express.urlencoded({ extended: false }), async (req, res) => {
  const { slug } = req.params;
  const { password } = req.body;
  const prisma = req.app.locals.prisma;
  const rawIP = req.ip || req.connection.remoteAddress || 'unknown';
  const ipAddress = hashIP(rawIP); // GDPR: hash IP for rate-limiting storage

  try {
    const link = await findLink(prisma, slug, req.customDomain);

    if (!link) {
      return render404(req, res, slug);
    }

    if (!link.passwordHash) {
      // Link is not password protected, just redirect
      return performRedirect(req, res, prisma, link);
    }

    // Check rate limit
    if (await isRateLimited(prisma, link.id, ipAddress)) {
      return res.status(429).send(
        passwordPromptPage(slug, 'Too many failed attempts. Please try again in 15 minutes.', req.customDomain?.domain)
      );
    }

    if (!password) {
      await logPasswordAttempt(prisma, link.id, ipAddress, false);
      return res.status(401).send(
        passwordPromptPage(slug, 'Please enter a password.', req.customDomain?.domain)
      );
    }

    const isValid = await bcrypt.compare(password, link.passwordHash);

    await logPasswordAttempt(prisma, link.id, ipAddress, isValid);

    if (!isValid) {
      return res.status(401).send(
        passwordPromptPage(slug, 'Incorrect password. Please try again.', req.customDomain?.domain)
      );
    }

    // Password correct - redirect
    return performRedirect(req, res, prisma, link);

  } catch (error) {
    console.error('Password unlock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:slug
 * Redirect to target URL and log analytics
 * Shows password prompt if link is protected
 */
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const prisma = req.app.locals.prisma;

  try {
    const link = await findLink(prisma, slug, req.customDomain);

    if (!link) {
      return render404(req, res, slug);
    }

    // If link is password protected, show password prompt
    if (link.passwordHash) {
      return res.status(401).send(
        passwordPromptPage(slug, null, req.customDomain?.domain)
      );
    }

    // No password - redirect directly
    return performRedirect(req, res, prisma, link);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
