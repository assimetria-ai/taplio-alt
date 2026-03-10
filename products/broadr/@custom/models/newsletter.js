// @custom/models/newsletter.js - Newsletter Scheduling Model

/**
 * Newsletter Model
 * Handles scheduled newsletter broadcasts across multiple channels
 */

const NEWSLETTER_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const CHANNEL_TYPE = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  SOCIAL: 'social'
};

const TIMEZONE_STRATEGY = {
  SENDER: 'sender_timezone',      // Use sender's timezone
  RECIPIENT: 'recipient_timezone', // Use each recipient's timezone
  OPTIMAL: 'optimal_time',        // AI-suggested optimal time
  FIXED: 'fixed_utc'              // Fixed UTC time
};

/**
 * Newsletter Schema (Prisma/MongoDB/PostgreSQL compatible)
 */
const NewsletterSchema = {
  id: 'String (UUID)',
  userId: 'String (owner)',
  workspaceId: 'String (optional)',
  
  // Content
  title: 'String',
  content: {
    subject: 'String',
    body: 'String (HTML/text)',
    preview: 'String (optional)',
    variables: 'JSON (for personalization)'
  },
  
  // Channels
  channels: [CHANNEL_TYPE.EMAIL], // Array of enabled channels
  
  // Recipients
  recipients: {
    listIds: ['String'], // Audience list IDs
    segmentIds: ['String'], // Segment IDs
    individualEmails: ['String'], // Individual recipients
    excludeIds: ['String'], // Exclude specific recipients
    totalCount: 0
  },
  
  // Scheduling
  scheduling: {
    strategy: TIMEZONE_STRATEGY.SENDER,
    scheduledAt: 'DateTime (ISO 8601)',
    timezone: 'String (IANA timezone)', // e.g., "America/New_York"
    optimalTimeSuggestion: {
      recommendedTime: 'DateTime',
      confidence: 'Number (0-1)',
      reasoning: 'String',
      basedOn: ['historical_opens', 'recipient_activity', 'industry_benchmarks']
    },
    sendWindow: {
      startTime: 'String (HH:MM)', // e.g., "09:00"
      endTime: 'String (HH:MM)',   // e.g., "17:00"
      daysOfWeek: [1, 2, 3, 4, 5]  // 0=Sunday, 6=Saturday
    }
  },
  
  // Queue Management
  queue: {
    priority: 'Number (1-10)', // Higher = more urgent
    batchSize: 'Number',       // Recipients per batch
    rateLimit: 'Number',       // Messages per minute
    retryPolicy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 60 // seconds
    }
  },
  
  // Status & Tracking
  status: NEWSLETTER_STATUS.DRAFT,
  sentAt: 'DateTime (nullable)',
  completedAt: 'DateTime (nullable)',
  
  // Analytics
  analytics: {
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalOpened: 0,
    totalClicked: 0,
    bounceRate: 0,
    openRate: 0,
    clickRate: 0,
    unsubscribed: 0
  },
  
  // A/B Testing (optional)
  abTest: {
    enabled: false,
    variants: [{
      id: 'String',
      subject: 'String',
      content: 'String',
      percentage: 50
    }],
    winnerMetric: 'open_rate' // 'open_rate' | 'click_rate'
  },
  
  // Metadata
  createdAt: 'DateTime',
  updatedAt: 'DateTime',
  createdBy: 'String (userId)',
  tags: ['String']
};

/**
 * Scheduled Job Schema (for queue processing)
 */
const ScheduledJobSchema = {
  id: 'String (UUID)',
  newsletterId: 'String',
  recipientId: 'String',
  recipientEmail: 'String',
  recipientTimezone: 'String',
  
  channel: CHANNEL_TYPE.EMAIL,
  
  scheduledFor: 'DateTime', // Actual send time in recipient's timezone
  attemptedAt: 'DateTime (nullable)',
  sentAt: 'DateTime (nullable)',
  
  status: 'pending | processing | sent | failed',
  
  errorMessage: 'String (nullable)',
  retryCount: 0,
  nextRetryAt: 'DateTime (nullable)',
  
  metadata: 'JSON',
  createdAt: 'DateTime'
};

/**
 * Optimal Send Time Cache
 * Stores AI-computed optimal send times for recipients
 */
const OptimalSendTimeCache = {
  recipientId: 'String',
  email: 'String',
  
  optimalHour: 'Number (0-23)', // Best hour to send
  optimalDay: 'Number (0-6)',   // Best day of week
  timezone: 'String',
  
  confidence: 'Number (0-1)',
  
  basedOn: {
    openHistory: 'JSON (timestamps)',
    clickHistory: 'JSON (timestamps)',
    sampleSize: 'Number',
    lastUpdated: 'DateTime'
  },
  
  updatedAt: 'DateTime'
};

module.exports = {
  NewsletterSchema,
  ScheduledJobSchema,
  OptimalSendTimeCache,
  NEWSLETTER_STATUS,
  CHANNEL_TYPE,
  TIMEZONE_STRATEGY
};
