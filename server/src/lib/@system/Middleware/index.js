const { pagination, formatPaginatedResponse } = require('./pagination')
const { csrfCookieMiddleware, csrfProtectMiddleware } = require('./csrf')
const { sorting, multiSort, formatSortClause } = require('./sorting')
const { filtering, advancedFiltering, parseBoolean, parseNumber, parseArray, parseDate } = require('./filtering')
const attachDatabase = require('./database')
const { authenticate, requireAdmin } = require('../Helpers/auth')

module.exports = {
  cors: require('./cors'),
  csrf: { csrfCookieMiddleware, csrfProtectMiddleware },
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
  csrfCookieMiddleware,
  csrfProtectMiddleware,

  // Database
  attachDatabase,
  
  // Auth
  authenticate,
  requireAdmin,
}
