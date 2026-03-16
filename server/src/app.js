const path = require('path')
const fs = require('fs')
const express = require('express')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const pinoHttp = require('pino-http')

const logger = require('./lib/@system/Logger')
const { cors, csrf, securityHeaders } = require('./lib/@system/Middleware')
const { apiLimiter } = require('./lib/@system/RateLimit')
const systemRoutes = require('./routes/@system')
const customRoutes = require('./routes/@custom')

// MIME type lookup for pre-compressed asset serving
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.map': 'application/json',
    '.ico': 'image/x-icon',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

const app = express()

// Health check endpoints registered before all middleware (including CORS) so that
// infrastructure health probes with no Origin header reach them without triggering
// CORS rejection. These are the only paths permitted to bypass CORS in production.
//
// Three health endpoints are provided for compatibility:
// - /health: Standard REST convention
// - /api/health: API-namespaced health endpoint
// - /healthz: Kubernetes/GKE convention
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }))
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }))

app.use(securityHeaders)
// CORS only for API routes — static files and SPA catch-all must be accessible
// via direct browser navigation (no Origin header). Previously applied globally,
// which caused HTTP 500 on direct navigation and broke frontend health checks.
app.use('/api', cors)
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
// CSRF: cookie middleware sets nonce, protect middleware validates on state-changing requests
// Must run AFTER cookieParser so req.cookies is populated
app.use('/api', csrf)

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }))
}

// General rate limiting for all API routes (baseline DoS protection)
app.use('/api', apiLimiter)

// Routes
app.use('/api', systemRoutes)
app.use('/api', customRoutes)

// API 404 — must be before SPA fallback so unmatched /api/* routes return JSON
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }))

// Serve React SPA in production
// Landing page support: if server/public/landing.html exists, serve it at root (/)
// so Railway deploys show the marketing landing page instead of the SPA shell.
// The SPA (dashboard) is still available at /app and all other routes.
const publicDir = path.join(__dirname, '..', 'public')
if (process.env.NODE_ENV === 'production' && fs.existsSync(publicDir)) {
  const landingFile = path.join(publicDir, 'landing.html')
  if (fs.existsSync(landingFile)) {
    app.get('/', (_req, res) => {
      res.sendFile(landingFile)
    })
  }
  // Serve pre-compressed brotli/gzip assets when available
  app.use((req, res, next) => {
    // Only for GET requests to static-looking paths (with file extensions)
    if (req.method !== 'GET' || !path.extname(req.path)) return next()
    const filePath = path.join(publicDir, req.path)
    const acceptEncoding = req.headers['accept-encoding'] || ''

    // Try brotli first, then gzip
    if (acceptEncoding.includes('br') && fs.existsSync(filePath + '.br')) {
      req.url = req.url + '.br'
      res.set('Content-Encoding', 'br')
      res.set('Content-Type', getMimeType(filePath))
    } else if (acceptEncoding.includes('gzip') && fs.existsSync(filePath + '.gz')) {
      req.url = req.url + '.gz'
      res.set('Content-Encoding', 'gzip')
      res.set('Content-Type', getMimeType(filePath))
    }
    next()
  })

  // Hashed assets (contain contenthash) → immutable, 1 year cache
  // Non-hashed assets (index.html, landing.html) → no-cache (always revalidate)
  app.use(express.static(publicDir, {
    setHeaders(res, filePath) {
      // Files with content hash in name (e.g. main.a1b2c3d4.js) are immutable
      if (/\.[a-f0-9]{8}\.(js|css|chunk\.js|chunk\.css|gz|br)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else if (/\.(png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|eot|ttf|otf|ico)$/i.test(filePath)) {
        // Static assets without hash — cache 1 day with revalidation
        res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate')
      } else {
        // HTML and other files — always revalidate
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      }
    },
  }))
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.sendFile(path.join(publicDir, 'index.html'))
  })
} else {
  // 404 (dev/test — client runs separately)
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' })
  })
}

// Error handler
app.use((err, req, res, _next) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, err.message ?? 'Internal server error')

  // Stripe SDK errors have a `type` field (e.g. StripeCardError, StripeInvalidRequestError).
  // Never expose raw Stripe messages to clients — they contain internal details such as
  // price/customer IDs, live-vs-test mode hints, and API key hints.
  if (err.type && err.type.startsWith('Stripe')) {
    const status = err.statusCode ?? 400

    // Card errors carry a user-safe decline message (e.g. "Your card has insufficient funds.")
    if (err.type === 'StripeCardError') {
      return res.status(status).json({ message: err.message ?? 'Your card was declined. Please check your payment details.' })
    }

    // Authentication errors mean a misconfigured API key — generic message for users
    if (err.type === 'StripeAuthenticationError') {
      return res.status(500).json({ message: 'Payment service is temporarily unavailable. Please try again later.' })
    }

    // Rate limit — tell the user to slow down
    if (err.type === 'StripeRateLimitError') {
      return res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' })
    }

    // All other Stripe errors (StripeInvalidRequestError, StripeAPIError, StripeConnectionError, etc.)
    return res.status(status >= 400 && status < 600 ? status : 400).json({
      message: 'Something went wrong with the payment service. Please try again or contact support.',
    })
  }

  const status = err.status ?? err.statusCode ?? 500
  res.status(status).json({ message: err.message ?? 'Internal server error' })
})

module.exports = app
