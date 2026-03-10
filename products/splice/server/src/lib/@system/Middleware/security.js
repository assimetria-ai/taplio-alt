const helmet = require('helmet')

/**
 * Security headers middleware built on helmet.
 * Task #10360 - XSS Protection with Content Security Policy
 *
 * Helmet sets sensible defaults for:
 *  - Content-Security-Policy (CSP) - XSS protection
 *  - Strict-Transport-Security (HSTS) - HTTPS enforcement
 *  - X-Frame-Options - Clickjacking protection
 *  - X-Content-Type-Options - MIME sniffing protection
 *  - Referrer-Policy - Privacy protection
 *  - Permissions-Policy - Feature control
 *  - Cross-Origin-* policies - Isolation protection
 */

/**
 * Production-grade CSP directives for XSS protection
 * Prevents execution of unauthorized scripts, styles, and resources
 */
const cspDirectives = {
  // Default fallback for any directive not explicitly defined
  defaultSrc: ["'self'"],
  
  // Script sources - strict control to prevent XSS
  scriptSrc: [
    "'self'",
    // Allow scripts from CDNs (uncomment as needed)
    // 'https://cdn.jsdelivr.net',
    // 'https://unpkg.com',
  ],
  
  // Only allow nonces or hashes for inline scripts in production
  // Add 'unsafe-inline' only if absolutely necessary (NOT recommended)
  
  // Style sources
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for most React/Vue apps with CSS-in-JS
    // Add CDN style sources if needed
    // 'https://fonts.googleapis.com',
  ],
  
  // Image sources - allow self, data URIs, and HTTPS images
  imgSrc: [
    "'self'",
    'data:',
    'https:',
    'blob:', // For dynamically generated images
  ],
  
  // Font sources
  fontSrc: [
    "'self'",
    'https:',
    'data:',
  ],
  
  // XHR/Fetch/WebSocket connections
  connectSrc: [
    "'self'",
    // Add API endpoints if different domain
    // process.env.API_URL,
  ],
  
  // Media sources (audio/video)
  mediaSrc: ["'self'"],
  
  // Object sources (Flash, Java, etc.) - disable for security
  objectSrc: ["'none'"],
  
  // Frame sources - prevent embedding untrusted content
  frameSrc: ["'none'"],
  // If you need to embed specific domains:
  // frameSrc: ["'self'", 'https://trusted-domain.com'],
  
  // Child sources (workers, frames)
  childSrc: ["'self'"],
  
  // Form submission targets
  formAction: ["'self'"],
  
  // Frame ancestors - who can embed THIS site
  frameAncestors: ["'none'"], // Prevent embedding in iframes (same as X-Frame-Options: DENY)
  
  // Base URI restriction
  baseUri: ["'self'"],
  
  // Manifest source
  manifestSrc: ["'self'"],
  
  // Upgrade insecure requests in production
  ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] }),
}

/**
 * Main security headers middleware
 */
const securityHeaders = helmet({
  // Content-Security-Policy - PRIMARY XSS DEFENSE
  contentSecurityPolicy: {
    directives: cspDirectives,
    // Report violations in production (setup reporting endpoint)
    ...(process.env.CSP_REPORT_URI && {
      reportUri: process.env.CSP_REPORT_URI,
    }),
  },

  // Strict-Transport-Security - Force HTTPS
  // Only enable in production with HTTPS
  hsts: process.env.NODE_ENV === 'production'
    ? {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // X-Frame-Options - Clickjacking protection
  frameguard: { action: 'deny' }, // DENY = cannot be embedded in any frame

  // X-Content-Type-Options - MIME sniffing protection
  noSniff: true,

  // Referrer-Policy - Control referrer information leakage
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
    // Options: 'no-referrer', 'same-origin', 'strict-origin', etc.
  },

  // Hide X-Powered-By header (security through obscurity)
  hidePoweredBy: true,

  // X-DNS-Prefetch-Control - Control DNS prefetching
  dnsPrefetchControl: { allow: false },

  // X-Download-Options - Prevent IE from executing downloads
  ieNoOpen: true,

  // Permissions-Policy (formerly Feature-Policy)
  // Control which browser features can be used
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      // Allow only if needed:
      // fullscreen: ["'self'"],
      // autoplay: ["'self'"],
    },
  },

  // Cross-Origin-Embedder-Policy
  // Set to true if using SharedArrayBuffer (advanced)
  crossOriginEmbedderPolicy: false,

  // Cross-Origin-Opener-Policy - Isolate browsing context
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // Cross-Origin-Resource-Policy - Control who can load resources
  crossOriginResourcePolicy: { policy: 'same-site' },

  // X-Permitted-Cross-Domain-Policies - Adobe Flash/PDF protection
  xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
})

/**
 * CSP violation reporting endpoint (optional)
 * Setup this route to collect CSP violations for monitoring
 * 
 * Example Express route:
 * app.post('/api/csp-violation-report', express.json({ type: 'application/csp-report' }), (req, res) => {
 *   console.log('CSP Violation:', req.body);
 *   // Log to your monitoring service (Sentry, Datadog, etc.)
 *   res.status(204).end();
 * });
 */

module.exports = securityHeaders
