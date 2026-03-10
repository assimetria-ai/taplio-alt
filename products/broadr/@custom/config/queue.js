// @custom/config/queue.js - Queue Configuration

/**
 * Newsletter Queue Configuration
 * Settings for scheduling, rate limiting, and queue processing
 */

module.exports = {
  // Queue Processing
  processing: {
    intervalMs: 60000,        // Check for due jobs every 60 seconds
    batchSize: 100,           // Default batch size
    maxConcurrent: 10,        // Maximum concurrent sending operations
    enabled: true             // Enable/disable queue processing
  },

  // Rate Limiting
  rateLimits: {
    email: {
      perMinute: 100,         // Max emails per minute (per newsletter)
      perHour: 5000,          // Max emails per hour (account-wide)
      perDay: 50000           // Max emails per day (account-wide)
    },
    sms: {
      perMinute: 50,
      perHour: 2000,
      perDay: 20000
    },
    push: {
      perMinute: 200,
      perHour: 10000,
      perDay: 100000
    }
  },

  // Retry Policy (defaults)
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,     // Exponential backoff
    initialDelay: 60,         // Initial delay in seconds
    maxDelay: 3600            // Maximum delay in seconds (1 hour)
  },

  // Timezone Configuration
  timezone: {
    defaultTimezone: 'UTC',
    supportedStrategies: [
      'sender_timezone',      // Use sender's timezone
      'recipient_timezone',   // Use each recipient's timezone
      'optimal_time',         // AI-suggested optimal time
      'fixed_utc'             // Fixed UTC time
    ],
    optimalTimeCache: {
      ttlDays: 7,             // Cache optimal times for 7 days
      minSampleSize: 5        // Minimum interactions needed for personalized suggestions
    }
  },

  // Send Window Configuration
  sendWindow: {
    default: {
      startTime: '09:00',     // Default start time
      endTime: '17:00',       // Default end time
      daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
    },
    respectRecipientTimezone: true
  },

  // Priority Levels
  priority: {
    urgent: 10,               // Transactional emails, critical alerts
    high: 7,                  // Time-sensitive campaigns
    normal: 5,                // Regular newsletters
    low: 3,                   // Bulk campaigns
    background: 1             // Low-priority bulk sends
  },

  // Analytics
  analytics: {
    trackOpens: true,
    trackClicks: true,
    trackUnsubscribes: true,
    trackBounces: true,
    aggregateInterval: 300000 // Update aggregate stats every 5 minutes
  },

  // Email Service Provider Settings
  providers: {
    email: {
      primary: 'sendgrid',    // Primary email provider
      fallback: 'ses',        // Fallback if primary fails
      config: {
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL,
          fromName: process.env.SENDGRID_FROM_NAME
        },
        ses: {
          region: process.env.AWS_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
    },
    sms: {
      primary: 'twilio',
      config: {
        twilio: {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          fromNumber: process.env.TWILIO_FROM_NUMBER
        }
      }
    }
  },

  // Database Settings
  database: {
    jobsTable: 'scheduled_jobs',
    newslettersTable: 'newsletters',
    optimalTimeCache: 'optimal_send_times',
    cleanupOldJobsDays: 30    // Delete old jobs after 30 days
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logSuccessfulSends: true,
    logFailures: true,
    logRetries: true
  }
};
