/**
 * @system Helpers
 * 
 * Reusable utilities for building APIs with common patterns
 */

const auth = require('./auth')
const jwt = require('./jwt')
const crud = require('./crud')
const search = require('./search')
const response = require('./response')
const queryBuilder = require('./query-builder')
const passwordValidator = require('./password-validator')
const apiUtils = require('./api-utils')

module.exports = {
  // Auth helpers
  ...auth,
  
  // JWT helpers
  ...jwt,
  
  // CRUD helpers
  ...crud,
  
  // Search helpers
  ...search,
  
  // Response helpers
  ...response,
  
  // Query builder helpers
  ...queryBuilder,
  
  // API utilities
  ...apiUtils,
  
  // Password validation
  validatePassword: passwordValidator.validatePassword,
}
