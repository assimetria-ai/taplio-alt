const crypto = require('crypto')
const { pagination, formatPaginatedResponse } = require('./pagination')
const csrfModule = require('./csrf')
const { csrfProtection, generateCsrfToken } = csrfModule
const { sorting, multiSort, formatSortClause } = require('./sorting')
const { filtering, advancedFiltering, parseBoolean, parseNumber, parseArray, parseDate } = require('./filtering')
const attachDatabase = require('./database')
const { authenticate, requireAdmin } = require('../Helpers/auth')

module.exports = {
  cors: require('./cors'),
  csrf: {
    csrfCookieMiddleware: (req, res, next) => {
      // Set a CSRF nonce cookie on every request for client consumption
      const nonce = crypto.randomBytes(32).toString('hex')
      res.cookie('csrf-nonce', nonce, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })
      next()
    },
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
