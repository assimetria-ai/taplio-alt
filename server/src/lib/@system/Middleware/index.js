const { pagination, formatPaginatedResponse } = require('./pagination')
const { csrfProtection, generateCsrfToken } = require('./csrf')
const attachDatabase = require('./database')
const { authenticate, requireAdmin } = require('../Helpers/auth')

module.exports = {
  cors: require('./cors'),
  securityHeaders: require('./security'),
  validate: require('../Validation').validate,
  pagination,
  formatPaginatedResponse,
  csrfProtection,
  generateCsrfToken,
  attachDatabase,
  authenticate,
  requireAdmin,
}
