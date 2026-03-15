// CSRF protection — X-CSRF-Token header synchronizer pattern
const crypto = require('crypto')

const CSRF_SECRET = (() => {
  if (process.env.CSRF_SECRET) return process.env.CSRF_SECRET
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[csrf] CSRF_SECRET environment variable is required in production. ' +
      'Generate one with: node -e "console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))"'
    )
  }
  return crypto.randomBytes(32).toString('hex')
})()

const NONCE_COOKIE  = 'csrf-nonce'
const CSRF_HEADER   = 'x-csrf-token'
const STATE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const CSRF_EXEMPT_PREFIXES = [
  '/api/sessions',
  '/api/auth/',
  '/api/oauth/',
  '/api/stripe/webhook',
]

function signNonce(nonce) {
  return crypto.createHmac('sha256', CSRF_SECRET).update(nonce).digest('hex')
}

function csrfCookieMiddleware(req, res, next) {
  let nonce = req.cookies[NONCE_COOKIE]
  if (!nonce) {
    nonce = crypto.randomBytes(32).toString('hex')
    res.cookie(NONCE_COOKIE, nonce, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }
  req.csrfToken = () => signNonce(nonce)
  next()
}

function csrfProtectMiddleware(req, res, next) {
  if (!STATE_METHODS.has(req.method)) return next()
  const url = req.originalUrl || req.path
  if (CSRF_EXEMPT_PREFIXES.some(prefix => url.startsWith(prefix))) return next()
  const nonce = req.cookies[NONCE_COOKIE]
  const headerToken = req.headers[CSRF_HEADER]
  if (!nonce || !headerToken) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'Please include a valid X-CSRF-Token header. Fetch a token from GET /api/csrf-token.',
    })
  }
  const expected = Buffer.from(signNonce(nonce))
  const provided = Buffer.from(headerToken)
  if (expected.length !== provided.length) {
    return res.status(403).json({ error: 'Invalid CSRF token', message: 'Form submission rejected. Please refresh and try again.' })
  }
  if (!crypto.timingSafeEqual(expected, provided)) {
    return res.status(403).json({ error: 'Invalid CSRF token', message: 'Form submission rejected. Please refresh and try again.' })
  }
  next()
}

module.exports = { csrfCookieMiddleware, csrfProtectMiddleware }
