// server/middleware/rateLimit.js - Rate limiting for redirect endpoints

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based solution like express-rate-limit with Redis store
 */

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.timestamp > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }

  // Get or create counter for this IP
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }

  const data = requestCounts.get(ip);
  
  // Reset if window expired
  if (now - data.timestamp > WINDOW_MS) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return next();
  }

  // Increment counter
  data.count++;

  // Check if limit exceeded
  if (data.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((WINDOW_MS - (now - data.timestamp)) / 1000)
    });
  }

  next();
}

module.exports = rateLimit;
