// @custom/index.js - DropMagic Custom Backend Entry Point

const dropRoutes = require('./routes/drops');
const dropScheduler = require('./services/dropScheduler');
const schedulerConfig = require('./config/scheduler');
const Drop = require('./models/drop');

/**
 * Initialize DropMagic backend
 * 
 * Call this from your main application setup
 */
function initialize(app) {
  // Register routes
  app.use('/api/drops', dropRoutes);

  // Start scheduler if enabled
  if (schedulerConfig.autoStart) {
    dropScheduler.start();
    console.log('[DropMagic] Drop scheduler started');
  }

  // Register shutdown handler
  process.on('SIGTERM', () => {
    console.log('[DropMagic] SIGTERM received, stopping scheduler...');
    dropScheduler.stop();
  });

  process.on('SIGINT', () => {
    console.log('[DropMagic] SIGINT received, stopping scheduler...');
    dropScheduler.stop();
  });

  console.log('[DropMagic] Backend initialized');
}

/**
 * Get scheduler instance for manual control
 */
function getScheduler() {
  return dropScheduler;
}

/**
 * Get Drop model for direct database access
 */
function getDropModel() {
  return Drop;
}

module.exports = {
  initialize,
  getScheduler,
  getDropModel,
  Drop
};
