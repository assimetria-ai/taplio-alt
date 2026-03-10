const csrf = require('csurf')
const logger = require('../Logger')

/**
 * CSRF Protection Middleware
 * Task #10361 - Implement csurf middleware in product template
 *
 * Cross-Site Request Forgery (CSRF) protection using synchronizer token pattern.
 * Protects state-changing operations (POST, PUT, PATCH, DELETE) from unauthorized requests.
 *
 * How it works:
 * 1. Server generates a CSRF token and stores it in a cookie
 * 2. Client includes token in requests via:
 *    - Request body (_csrf field)
 *    - Query string (?_csrf=token)
 *    - Custom header (X-CSRF-Token or CSRF-Token)
 * 3. Server validates token matches the cookie value
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

/**
 * CSRF middleware configuration
 */
const csrfProtection = csrf({
  // Use cookies to store CSRF token (default)
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // Task #10362 - CSRF protection with better usability
    maxAge: 3600, // 1 hour in seconds
  },

  // Allow token to be passed in multiple ways
  value: (req) => {
    // Check in order of preference:
    // 1. Custom header (recommended for AJAX requests)
    // 2. Request body (for form submissions)
    // 3. Query string (fallback, less secure)
    return (
      req.headers['x-csrf-token'] ||
      req.headers['csrf-token'] ||
      req.body?._csrf ||
      req.query?._csrf
    )
  },

  // Ignore CSRF for GET, HEAD, OPTIONS (safe methods)
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
})

/**
 * CSRF error handler
 * Provides user-friendly error messages for CSRF failures
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    // Not a CSRF error, pass to next error handler
    return next(err)
  }

  // Log CSRF violation for security monitoring
  logger.warn({
    type: 'csrf_violation',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'CSRF token validation failed')

  // Return user-friendly error
  res.status(403).json({
    error: 'invalid_csrf_token',
    message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
  })
}

/**
 * Endpoint to get a fresh CSRF token
 * Frontend should call this on app load to get initial token
 *
 * Usage in Express:
 * app.get('/api/csrf-token', csrfProtection, getCsrfToken)
 */
const getCsrfToken = (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
  })
}

/**
 * Conditional CSRF protection
 * Apply CSRF only to specific routes or exclude certain paths
 *
 * Example usage:
 * app.use(conditionalCsrf(['/api/public'])) // Exclude public API
 */
const conditionalCsrf = (excludePaths = []) => {
  return (req, res, next) => {
    // Skip CSRF for excluded paths
    const isExcluded = excludePaths.some(path => req.path.startsWith(path))
    if (isExcluded) {
      return next()
    }

    // Skip CSRF for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']
    if (safeMethods.includes(req.method)) {
      return next()
    }

    // Apply CSRF protection
    csrfProtection(req, res, next)
  }
}

module.exports = {
  csrfProtection,
  csrfErrorHandler,
  getCsrfToken,
  conditionalCsrf,
}
