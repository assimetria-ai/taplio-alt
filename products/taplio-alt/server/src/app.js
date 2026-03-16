const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { get } = require('./lib/@system/Env');
const { buildAllowedOrigins, createCorsMiddleware } = require('./lib/@system/Middleware/cors');
const { csrfCookieMiddleware, csrfProtectMiddleware } = require('./lib/@system/Middleware/csrf');
const { createLimiter } = require('./lib/@system/RateLimit');
const { sanitizeBody } = require('./lib/@system/Middleware/validate');

const app = express();

// ─── Trust proxy ──────────────────────────────────────────────────────────────
// Required when running behind a reverse proxy (nginx, Caddy, AWS ALB, etc.)
// so that req.ip reflects the real client IP from X-Forwarded-For rather than
// the proxy's address.  Without this, rate limiting and IP-based security are
// scoped to the proxy IP, making them ineffective.
// Set TRUST_PROXY=false to disable (e.g. when not behind a proxy in development).
if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', 1);
}

// ─── Security headers (helmet) ───────────────────────────────────────────────
// Must run before CORS so Content-Security-Policy is set on every response.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc:         ["'self'", 'data:', 'https:'],
      connectSrc:     ["'self'"],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      objectSrc:      ["'none'"],
      frameSrc:       ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled to allow embedded assets from CDNs
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
// task #8278 — configure allowed origins per environment.
// Localhost origins are excluded automatically in production.
const isProd = process.env.NODE_ENV === 'production';

// Read approved production origins from CORS_ALLOWED_ORIGINS env var (task #8278).
// Required in production. Comma-separated list of full origins.
// Example: CORS_ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
const corsAllowedEnv = process.env.CORS_ALLOWED_ORIGINS;
const APPROVED_PRODUCTION_ORIGINS = new Set(
  corsAllowedEnv ? corsAllowedEnv.split(',').map(o => o.trim()).filter(Boolean) : []
);

const allowedOrigins = buildAllowedOrigins({
  isProd,
  appUrl: get('APP_URL'),
  productionOrigins: APPROVED_PRODUCTION_ORIGINS,
});

// CORS only for /api/* routes — static files and SPA routes don't need CORS
// and must be served without an Origin header (browsers don't send one for
// same-origin page navigations).
app.use('/api', createCorsMiddleware({
  allowedOrigins,
  credentials: true, // Allow cookies and auth headers
}));

// ─── HTTP request logger ──────────────────────────────────────────────────────
// Logs method, path, status code, and response time for every API request.
// Mounted after CORS so req.ip reflects the real client address from X-Forwarded-For.
const requestLogger = require('./lib/@system/Middleware/request-logger');
app.use(requestLogger);

// ─── Stripe webhook (MUST be before body parsing and CSRF) ───────────────────
// Raw body is required for Stripe signature verification.
// Mounted before CSRF middleware so webhook requests are not subject to it —
// they are authenticated by Stripe's own HMAC signature instead.
const stripe = require('./lib/@system/Stripe');
const logger = require('./lib/@system/Logger');

// In-memory event deduplication store — 24 h TTL, cleaned up hourly.
// Prevents double-processing when Stripe retries an event.
const _webhookEventCache = new Map();
const _WEBHOOK_EVENT_TTL_MS = 24 * 60 * 60 * 1000;
const _WEBHOOK_TIMESTAMP_TOLERANCE_S = 5 * 60; // 5 minutes
setInterval(() => {
  const cutoff = Date.now() - _WEBHOOK_EVENT_TTL_MS;
  for (const [id, ts] of _webhookEventCache) {
    if (ts < cutoff) _webhookEventCache.delete(id);
  }
}, 60 * 60 * 1000).unref();

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // Return 200 regardless — revealing 400 on bad signatures enables endpoint enumeration.
    logger.warn({ err }, 'stripe webhook signature verification failed');
    return res.status(200).json({ received: true });
  }

  // Reject stale events (> 5 min old) to limit replay-attack window.
  const eventAgeS = Math.floor(Date.now() / 1000) - event.created;
  if (eventAgeS > _WEBHOOK_TIMESTAMP_TOLERANCE_S) {
    logger.warn({ eventId: event.id, ageSeconds: eventAgeS }, 'stripe webhook event too old, ignoring');
    return res.status(200).json({ received: true });
  }

  // Idempotency — ignore duplicate event IDs within the 24 h dedup window.
  if (_webhookEventCache.has(event.id)) {
    logger.info({ eventId: event.id }, 'stripe webhook duplicate event ignored');
    return res.status(200).json({ received: true });
  }
  _webhookEventCache.set(event.id, Date.now());

  logger.info({ eventType: event.type }, 'stripe webhook received');

  try {
    const { handleStripeWebhook } = require('./api/@system/stripe/webhook-handler');
    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'stripe webhook handler error');
    res.json({ received: true, warning: err.message });
  }
});

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Limit body size to prevent DoS via oversized payloads.
// extended: false uses Node's built-in querystring parser (flat key=value pairs),
// which avoids the prototype-pollution risk of the qs library (extended: true).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ─── Cookie parsing (required by CSRF middleware) ─────────────────────────────
app.use(cookieParser());

// ─── Global rate limiter ──────────────────────────────────────────────────────
// Broad baseline: 500 requests per 15 minutes per IP across all API routes.
// Auth-specific limiters in routes/sessions.js enforce stricter per-endpoint limits.
const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  prefix: 'rl:global-api:',
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', globalApiLimiter);

// ─── Input sanitization ───────────────────────────────────────────────────────
// Strips null bytes and control characters from all incoming string fields.
// Protects against null-byte injection and oversized field values.
// Per-route validation (field-level rules) lives in lib/@system/Middleware/validate.js.
app.use(sanitizeBody);

// ─── CSRF protection (task #8274) ─────────────────────────────────────────────
//
// Two-layer X-CSRF-Token synchronizer pattern:
//
//   1. csrfCookieMiddleware — sets a random nonce in a non-httpOnly cookie and
//      attaches req.csrfToken(), which returns HMAC-SHA256(nonce, CSRF_SECRET).
//      The client reads the cookie value and sends the signed token in the
//      X-CSRF-Token request header on every state-changing call.
//
//   2. csrfProtectMiddleware — on POST / PUT / PATCH / DELETE, re-derives
//      HMAC(nonce from cookie) and compares it with the X-CSRF-Token header
//      value via crypto.timingSafeEqual.  Rejects with 403 on mismatch or
//      absence.
//
// SameSite: strict is applied to the nonce cookie as a defence-in-depth
// measure, but the HMAC header check is the primary gate — SameSite alone
// is insufficient because it is not enforced uniformly across all browsers
// and does not cover all cross-site navigation scenarios.
//
// The Stripe webhook above is exempt because it is mounted before these
// middleware layers and is authenticated by Stripe's own HMAC signature.
app.use(csrfCookieMiddleware);
app.use(csrfProtectMiddleware);

// ─── CSRF token endpoint ──────────────────────────────────────────────────────
// SPAs and server-rendered pages call this on load to obtain the signed token
// they must echo back in the X-CSRF-Token header on every mutating request.
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
const systemRoutes = require('./routes/@system')
const customRoutes = require('./routes/@custom')

app.use('/api', systemRoutes)
app.use('/api', customRoutes)

// ─── Health check ─────────────────────────────────────────────────────────────
// Exempt from CORS (see cors.js DEFAULT_HEALTH_CHECK_PATHS) so monitoring probes
// that send no Origin header continue to work.
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Static SPA serving ──────────────────────────────────────────────────────
// Serve the Vite-built frontend from the dist/ directory.
// The SPA catch-all must come AFTER all API routes so /api/* is handled by Express.
const path = require('path');
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  // Only serve index.html for non-API routes (API 404s should return JSON)
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Error handler ────────────────────────────────────────────────────────────
// In production, return a generic message for unexpected errors so internal
// details (stack traces, DB errors, library messages) are never sent to clients.
// Known AppErrors carry a safe .message and explicit .status, so they pass through.
app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error({ err, status }, 'unhandled error');

  // Only surface the error message for explicit application errors (status < 500).
  // 5xx errors use a generic message in production to avoid information leakage.
  const isProd = process.env.NODE_ENV === 'production';
  const message = (isProd && status >= 500)
    ? 'Internal server error'
    : (err.message || 'Internal server error');

  res.status(status).json({ error: message });
});

module.exports = app;
