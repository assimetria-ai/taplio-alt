const { pagination, formatPaginatedResponse } = require('./pagination')
const { csrfProtection, generateCsrfToken } = require('./csrf')
const { sorting, multiSort, formatSortClause } = require('./sorting')
const { filtering, advancedFiltering, parseBoolean, parseNumber, parseArray, parseDate } = require('./filtering')
const attachDatabase = require('./database')
const { authenticate, requireAdmin } = require('../Helpers/auth')

const csrfModule = require('./csrf')

module.exports = {
  cors: require('./cors'),
  csrf: {
    csrfCookieMiddleware: csrfModule.generateCsrfToken ? (req, res, next) => {
      // Set a CSRF nonce cookie on every request for client consumption
      const crypto = require('crypto')
      const nonce = crypto.randomBytes(32).toString('hex')
      res.cookie('csrf-nonce', nonce, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })
      next()
    } : (req, res, next) => next(),
    csrfProtectMiddleware: csrfModule.csrfProtection,
  },
  securityHeaders: require('./security'),
  validate: require('../Validation').validate,
  
  // Pagination
  pagination,
  formatPaginatedResponse,
  
  // Sorting
  sorting,
  multiSort,
  formatSortClause,
  
  // Filtering
  filtering,
  advancedFiltering,
  parseBoolean,
  parseNumber,
  parseArray,
  parseDate,
  
  // CSRF
  csrfProtection,
  generateCsrfToken,
  
  // Database
  attachDatabase,
  
  // Auth
  authenticate,
  requireAdmin,
}
