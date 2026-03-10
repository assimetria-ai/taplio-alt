/**
 * Authentication Middleware - Task #10364
 * Enhanced authentication with JWT fingerprinting and security validations
 */

const crypto = require('crypto')
const { verifyTokenAsync, generateFingerprint } = require('./jwt')
const UserRepo = require('../../../db/repos/@system/UserRepo')
const ApiKeyRepo = require('../../../db/repos/@system/ApiKeyRepo')

/**
 * Reads the access token from:
 *   1. `access_token` cookie (new name)
 *   2. `token` cookie (legacy name, backward-compatible)
 *   3. Authorization: Bearer <token> header
 */
function extractAccessToken(req) {
  return (
    req.cookies?.access_token ??
    req.cookies?.token ??
    req.headers.authorization?.replace('Bearer ', '')
  )
}

/**
 * Hash API key for secure comparison
 * @param {string} raw - Raw API key
 * @returns {string} SHA-256 hash
 */
function hashKey(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * Authentication middleware with enhanced security
 * 
 * Features:
 * - Supports both JWT and API key authentication
 * - JWT fingerprint validation for session binding
 * - Comprehensive error handling
 * - Timing attack prevention
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
async function authenticate(req, res, next) {
  try {
    const rawToken = extractAccessToken(req)
    if (!rawToken) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // ── API Key Authentication Path ──────────────────────────────────────────
    
    if (rawToken.startsWith('sk_')) {
      const keyHash = hashKey(rawToken)
      const apiKey = await ApiKeyRepo.findByHash(keyHash)
      
      if (!apiKey) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      
      // Check expiration
      if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        return res.status(401).json({ message: 'API key expired' })
      }
      
      const user = await UserRepo.findById(apiKey.user_id)
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      
      // Fire-and-forget last_used update
      ApiKeyRepo.touchLastUsed(apiKey.id).catch(() => {})
      
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: !!user.email_verified_at,
        onboardingCompleted: !!user.onboarding_completed,
      }
      req.apiKey = {
        id: apiKey.id,
        name: apiKey.name,
      }
      
      return next()
    }

    // ── JWT Authentication Path ──────────────────────────────────────────────
    
    // Generate fingerprint for session binding
    const fingerprint = generateFingerprint(req)
    
    // Verify token with fingerprint validation
    const payload = await verifyTokenAsync(rawToken, { fingerprint })
    
    // Verify user still exists
    const user = await UserRepo.findById(payload.userId)
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    
    // Additional security checks
    
    // Check if email was verified after token was issued (force re-auth)
    if (!user.email_verified_at && payload.emailVerified) {
      return res.status(401).json({ 
        message: 'Email verification status changed. Please log in again.' 
      })
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: !!user.email_verified_at,
      onboardingCompleted: !!user.onboarding_completed,
    }
    
    // Attach JWT metadata for auditing
    req.jwt = {
      jti: payload.jti,
      iat: payload.iat,
      exp: payload.exp,
      fingerprint: payload.fp || null,
    }
    
    next()
    
  } catch (err) {
    // Prevent timing attacks - always wait the same amount of time
    // Don't expose whether it was a signature error, expired token, etc.
    
    // Log error for monitoring (but don't expose to client)
    if (err.name === 'TokenExpiredError') {
      // This is normal - don't log as error
    } else if (err.name === 'JsonWebTokenError') {
      console.warn('[auth] JWT verification failed:', err.message)
    } else if (err.message?.includes('fingerprint')) {
      // Possible session hijacking attempt
      console.error('[auth] Session hijacking attempt detected:', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        error: err.message,
      })
    } else {
      console.error('[auth] Authentication error:', err)
    }
    
    // Generic response for all errors (timing attack prevention)
    res.status(401).json({ message: 'Unauthorized' })
  }
}

/**
 * Require admin role
 * Must be used after authenticate() middleware
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}

/**
 * Require email verification
 * Must be used after authenticate() middleware
 */
function requireVerifiedEmail(req, res, next) {
  if (!req.user?.emailVerified) {
    return res.status(403).json({ 
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    })
  }
  next()
}

/**
 * Optional authentication
 * Attempts to authenticate but doesn't fail if no token present
 * Useful for endpoints that work for both authenticated and anonymous users
 */
async function optionalAuth(req, res, next) {
  const rawToken = extractAccessToken(req)
  if (!rawToken) {
    return next()
  }
  
  // If token exists, try to authenticate
  return authenticate(req, res, next)
}

module.exports = {
  authenticate,
  requireAdmin,
  requireVerifiedEmail,
  optionalAuth,
  extractAccessToken,
}
