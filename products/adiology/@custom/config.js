/**
 * Adiology — Configuration
 * 
 * Environment config + validation
 * Bootstrap placeholder - to be implemented based on product specs
 */

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'sqlite::memory:',
  },
  
  // Add product-specific config here
};
