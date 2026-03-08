// config/scheduler.js - Scheduler Configuration

module.exports = {
  // How often to check for scheduled drops (in milliseconds)
  checkIntervalMs: process.env.DROP_CHECK_INTERVAL_MS || 60 * 1000, // Default: 1 minute

  // Auto-start scheduler on application boot
  autoStart: process.env.DROP_SCHEDULER_AUTO_START !== 'false', // Default: true

  // Enable/disable notifications
  notificationsEnabled: process.env.DROP_NOTIFICATIONS_ENABLED !== 'false', // Default: true

  // Email service configuration (placeholder)
  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    apiKey: process.env.EMAIL_API_KEY,
    fromAddress: process.env.EMAIL_FROM || 'drops@dropmagic.io',
    fromName: process.env.EMAIL_FROM_NAME || 'DropMagic'
  },

  // Timezone for scheduling (useful for UI display)
  defaultTimezone: process.env.DEFAULT_TIMEZONE || 'UTC'
};
