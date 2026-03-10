/**
 * JWT Security Module - Task #10364
 * Production-hardened JWT configuration with enhanced security
 * 
 * Security improvements:
 * - RS256 asymmetric signing (prevents key confusion attacks)
 * - JWT ID (jti) for token tracking and revocation
 * - Issuer (iss) and audience (aud) validation
 * - Subject (sub) and not-before (nbf) claims
 * - Token fingerprinting for session binding
 * - Comprehensive claim validation
 * - Secure key loading with multiple sources
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
 */

const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { promisify } = require('util')

// ── Security Constants ─────────────────────────────────────────────────────

const ALGORITHM = 'RS256' // Asymmetric signing prevents secret confusion

// JWT Claims (RFC 7519)
const ISSUER = process.env.JWT_ISSUER || 'splice-app'
const AUDIENCE = process.env.JWT_AUDIENCE || 'splice-client'

// Token TTLs - Keep access tokens short-lived
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m' // 15 minutes
const DEFAULT_NBF_DELAY = 0 // Not-before delay (seconds) - set to prevent clock skew issues

// Clock tolerance for exp/nbf validation (seconds)
const CLOCK_TOLERANCE = parseInt(process.env.JWT_CLOCK_TOLERANCE) || 10

// ── Key Loading ────────────────────────────────────────────────────────────

/**
 * Load PEM key from file path
 * @private
 */
function readPemFile(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath)
  
  try {
    return fs.readFileSync(resolved, 'utf8').trim()
  } catch (err) {
    throw new Error(`[jwt] Failed to read key file "${filePath}": ${err.message}`)
  }
}

/**
 * Parse inline PEM key from environment variable
 * Handles escaped newlines from secrets managers
 * @private
 */
function parsePemKey(raw) {
  if (!raw) return null
  // Handle both literal \n and actual newlines
  return raw.replace(/\\n/g, '\n').trim()
}

/**
 * Load key from file or inline environment variable
 * Priority: file path → inline PEM
 * @private
 */
function loadKey(fileEnvVar, inlineEnvVar, keyType = 'key') {
  const filePath = process.env[fileEnvVar]
  
  if (filePath) {
    try {
      const key = readPemFile(filePath)
      console.log(`[jwt] Loaded ${keyType} from file: ${filePath}`)
      return key
    } catch (err) {
      throw new Error(`[jwt] ${keyType} file error: ${err.message}`)
    }
  }
  
  const inlineKey = parsePemKey(process.env[inlineEnvVar])
  if (inlineKey) {
    console.log(`[jwt] Loaded ${keyType} from environment variable`)
    return inlineKey
  }
  
  return null
}

// Load RSA key pair
const PRIVATE_KEY = loadKey('JWT_PRIVATE_KEY_FILE', 'JWT_PRIVATE_KEY', 'private key')
const PUBLIC_KEY = loadKey('JWT_PUBLIC_KEY_FILE', 'JWT_PUBLIC_KEY', 'public key')

// ── Key Validation ─────────────────────────────────────────────────────────

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  const msg =
    '[jwt] ⚠️  JWT keys not configured — token operations will fail.\n' +
    '\n' +
    'Security requirement: RS256 requires an RSA key pair.\n' +
    '\n' +
    'Setup options:\n' +
    '  A) File-based (recommended for development):\n' +
    '     1. Generate keys: npm run generate-keys\n' +
    '     2. Set: JWT_PRIVATE_KEY_FILE=./keys/jwt_private.pem\n' +
    '     3. Set: JWT_PUBLIC_KEY_FILE=./keys/jwt_public.pem\n' +
    '\n' +
    '  B) Inline (recommended for production/Railway/Doppler):\n' +
    '     1. Generate keys: npm run generate-keys\n' +
    '     2. Copy PEM content to JWT_PRIVATE_KEY env var\n' +
    '     3. Copy PEM content to JWT_PUBLIC_KEY env var\n' +
    '     (newlines will be auto-handled)\n'
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[jwt] FATAL: JWT keys must be configured in production.\n' + msg)
  }
  
  console.warn(msg)
}

// ── Promisified JWT Functions ──────────────────────────────────────────────

const _signAsync = promisify(jwt.sign)
const _verifyAsync = promisify(jwt.verify)

// ── Token Generation ───────────────────────────────────────────────────────

/**
 * Generate a unique JWT ID (jti) for token tracking
 * @returns {string} 32-character hex string
 */
function generateJwtId() {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Generate token fingerprint from request
 * Used to bind token to specific browser/device
 * @param {Object} req - Express request object
 * @returns {string} SHA-256 hash of user-agent + IP
 */
function generateFingerprint(req) {
  if (!req) return null
  
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.ip || req.connection?.remoteAddress || ''
  
  return crypto
    .createHash('sha256')
    .update(`${userAgent}:${ip}`)
    .digest('hex')
}

/**
 * Build secure JWT payload with all required claims
 * @param {Object} data - User data to encode
 * @param {Object} options - Additional options
 * @returns {Object} Complete JWT payload
 * @private
 */
function buildPayload(data, options = {}) {
  const now = Math.floor(Date.now() / 1000)
  
  return {
    // Standard claims (RFC 7519)
    jti: options.jti || generateJwtId(),          // JWT ID for revocation
    iss: options.iss || ISSUER,                   // Issuer
    aud: options.aud || AUDIENCE,                 // Audience
    sub: options.sub || data.userId?.toString(),  // Subject (user ID)
    iat: now,                                      // Issued at
    nbf: options.nbf || (now + DEFAULT_NBF_DELAY), // Not before
    // exp is set by expiresIn option
    
    // Custom claims (application data)
    ...data,
    
    // Security fingerprint (optional but recommended)
    ...(options.fingerprint && { fp: options.fingerprint }),
  }
}

/**
 * Sign a JWT token (synchronous)
 * @param {Object} payload - Token payload (must include userId)
 * @param {Object} options - Signing options
 * @param {string} [options.expiresIn] - Token expiration (default: ACCESS_TOKEN_TTL)
 * @param {string} [options.jti] - JWT ID (auto-generated if not provided)
 * @param {string} [options.fingerprint] - Token fingerprint for session binding
 * @returns {string} Signed JWT token
 */
function signToken(payload, options = {}) {
  if (!PRIVATE_KEY) {
    throw new Error('[jwt] Cannot sign token: private key not configured')
  }
  
  if (!payload.userId) {
    throw new Error('[jwt] userId is required in token payload')
  }
  
  const fullPayload = buildPayload(payload, options)
  
  return jwt.sign(fullPayload, PRIVATE_KEY, {
    algorithm: ALGORITHM,
    expiresIn: options.expiresIn || ACCESS_TOKEN_TTL,
    // Don't pass jti/iss/aud again - already in payload
  })
}

/**
 * Sign a JWT token (asynchronous)
 * @param {Object} payload - Token payload
 * @param {Object} options - Signing options
 * @returns {Promise<string>} Signed JWT token
 */
async function signTokenAsync(payload, options = {}) {
  if (!PRIVATE_KEY) {
    throw new Error('[jwt] Cannot sign token: private key not configured')
  }
  
  if (!payload.userId) {
    throw new Error('[jwt] userId is required in token payload')
  }
  
  const fullPayload = buildPayload(payload, options)
  
  return _signAsync(fullPayload, PRIVATE_KEY, {
    algorithm: ALGORITHM,
    expiresIn: options.expiresIn || ACCESS_TOKEN_TTL,
  })
}

// ── Token Verification ─────────────────────────────────────────────────────

/**
 * Verify JWT token with comprehensive validation (synchronous)
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @param {string} [options.audience] - Expected audience
 * @param {string} [options.issuer] - Expected issuer
 * @param {string} [options.fingerprint] - Expected fingerprint for session binding
 * @returns {Object} Decoded and validated token payload
 * @throws {Error} If token is invalid, expired, or fails validation
 */
function verifyToken(token, options = {}) {
  if (!PUBLIC_KEY) {
    throw new Error('[jwt] Cannot verify token: public key not configured')
  }
  
  // Verify signature and standard claims
  const decoded = jwt.verify(token, PUBLIC_KEY, {
    algorithms: [ALGORITHM],
    audience: options.audience || AUDIENCE,
    issuer: options.issuer || ISSUER,
    clockTolerance: CLOCK_TOLERANCE,
  })
  
  // Additional security validations
  validateTokenClaims(decoded, options)
  
  return decoded
}

/**
 * Verify JWT token (asynchronous)
 * @param {string} token - JWT token to verify
 * @param {Object} options - Verification options
 * @returns {Promise<Object>} Decoded and validated token payload
 */
async function verifyTokenAsync(token, options = {}) {
  if (!PUBLIC_KEY) {
    throw new Error('[jwt] Cannot verify token: public key not configured')
  }
  
  const decoded = await _verifyAsync(token, PUBLIC_KEY, {
    algorithms: [ALGORITHM],
    audience: options.audience || AUDIENCE,
    issuer: options.issuer || ISSUER,
    clockTolerance: CLOCK_TOLERANCE,
  })
  
  // Additional security validations
  validateTokenClaims(decoded, options)
  
  return decoded
}

/**
 * Validate additional token security claims
 * @param {Object} decoded - Decoded JWT payload
 * @param {Object} options - Validation options
 * @throws {Error} If validation fails
 * @private
 */
function validateTokenClaims(decoded, options = {}) {
  // Validate required custom claims
  if (!decoded.userId) {
    throw new Error('Token missing required claim: userId')
  }
  
  if (!decoded.jti) {
    throw new Error('Token missing required claim: jti (JWT ID)')
  }
  
  // Validate fingerprint if provided (session binding)
  if (options.fingerprint && decoded.fp) {
    if (decoded.fp !== options.fingerprint) {
      throw new Error('Token fingerprint mismatch - possible session hijacking attempt')
    }
  }
  
  // Validate subject matches userId
  if (decoded.sub && decoded.sub !== decoded.userId.toString()) {
    throw new Error('Token subject (sub) does not match userId')
  }
}

// ── Convenience Aliases ────────────────────────────────────────────────────

// Semantic aliases for access token operations
const signAccessToken = signToken
const signAccessTokenAsync = signTokenAsync
const verifyAccessToken = verifyToken
const verifyAccessTokenAsync = verifyTokenAsync

// ── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  // Token generation
  signToken,
  signTokenAsync,
  signAccessToken,
  signAccessTokenAsync,
  
  // Token verification
  verifyToken,
  verifyTokenAsync,
  verifyAccessToken,
  verifyAccessTokenAsync,
  
  // Security utilities
  generateJwtId,
  generateFingerprint,
  
  // Configuration
  ACCESS_TOKEN_TTL,
  ALGORITHM,
  ISSUER,
  AUDIENCE,
}
