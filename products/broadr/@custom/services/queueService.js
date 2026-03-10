// @custom/services/queueService.js - Newsletter Queue Management Service

/**
 * Queue Service
 * Manages newsletter scheduling, queuing, and batch processing
 */

const { NEWSLETTER_STATUS, TIMEZONE_STRATEGY } = require('../models/newsletter');
const {
  convertToRecipientTimezone,
  findNextValidSendTime,
  suggestOptimalSendTime,
  getCurrentTimeInTimezone
} = require('../utils/timezone');

class QueueService {
  constructor(database, emailService) {
    this.db = database; // Database connection (Prisma/MongoDB/etc.)
    this.emailService = emailService; // Email sending service
    this.processingIntervalId = null;
    this.isProcessing = false;
  }

  /**
   * Schedule a newsletter for sending
   * @param {Object} newsletter - Newsletter configuration
   * @returns {Promise<Object>} - Scheduled newsletter with jobs
   */
  async scheduleNewsletter(newsletter) {
    try {
      // Validate newsletter
      this.validateNewsletter(newsletter);

      // Update newsletter status to SCHEDULED
      newsletter.status = NEWSLETTER_STATUS.SCHEDULED;

      // Get recipients list
      const recipients = await this.getRecipients(newsletter.recipients);

      // Create scheduled jobs for each recipient
      const jobs = await this.createScheduledJobs(newsletter, recipients);

      // Update newsletter with job count
      newsletter.recipients.totalCount = recipients.length;
      newsletter.analytics = {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalOpened: 0,
        totalClicked: 0,
        bounceRate: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribed: 0
      };

      // Save to database
      const savedNewsletter = await this.db.saveNewsletter(newsletter);

      return {
        newsletter: savedNewsletter,
        jobsCreated: jobs.length,
        estimatedSendTime: jobs[0]?.scheduledFor
      };
    } catch (error) {
      throw new Error(`Failed to schedule newsletter: ${error.message}`);
    }
  }

  /**
   * Create scheduled jobs for all recipients
   * @param {Object} newsletter - Newsletter configuration
   * @param {Array} recipients - List of recipients
   * @returns {Promise<Array>} - Created jobs
   */
  async createScheduledJobs(newsletter, recipients) {
    const jobs = [];
    const { scheduling, channels, queue } = newsletter;

    for (const recipient of recipients) {
      let scheduledFor;

      // Determine send time based on scheduling strategy
      switch (scheduling.strategy) {
        case TIMEZONE_STRATEGY.SENDER:
          scheduledFor = new Date(scheduling.scheduledAt);
          break;

        case TIMEZONE_STRATEGY.RECIPIENT:
          scheduledFor = convertToRecipientTimezone(
            scheduling.scheduledAt,
            scheduling.timezone,
            recipient.timezone || 'UTC'
          );
          break;

        case TIMEZONE_STRATEGY.OPTIMAL:
          const optimal = await this.getOptimalSendTime(recipient);
          scheduledFor = new Date(optimal.recommendedTime);
          break;

        case TIMEZONE_STRATEGY.FIXED:
        default:
          scheduledFor = new Date(scheduling.scheduledAt);
          break;
      }

      // Apply send window constraints
      if (scheduling.sendWindow) {
        scheduledFor = findNextValidSendTime(
          scheduledFor,
          scheduling.sendWindow,
          recipient.timezone || scheduling.timezone
        );
      }

      // Create job for each enabled channel
      for (const channel of channels) {
        const job = {
          id: this.generateJobId(),
          newsletterId: newsletter.id,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          recipientTimezone: recipient.timezone || 'UTC',
          channel,
          scheduledFor: scheduledFor.toISOString(),
          status: 'pending',
          retryCount: 0,
          metadata: {
            priority: queue.priority || 5,
            batchSize: queue.batchSize || 100,
            rateLimit: queue.rateLimit || 100
          },
          createdAt: new Date().toISOString()
        };

        jobs.push(job);
      }
    }

    // Save all jobs to database
    await this.db.saveScheduledJobs(jobs);

    return jobs;
  }

  /**
   * Get optimal send time for a recipient
   * @param {Object} recipient - Recipient data
   * @returns {Promise<Object>} - Optimal time suggestion
   */
  async getOptimalSendTime(recipient) {
    // Check cache first
    const cached = await this.db.getOptimalTimeCache(recipient.id);
    
    if (cached && this.isCacheValid(cached)) {
      return {
        recommendedTime: this.calculateNextOptimalTime(cached),
        confidence: cached.confidence,
        reasoning: `Based on cached behavior analysis`,
        basedOn: ['historical_opens', 'cached_analysis']
      };
    }

    // Fetch recipient's interaction history
    const openHistory = await this.db.getOpenHistory(recipient.id);
    const clickHistory = await this.db.getClickHistory(recipient.id);

    // Calculate optimal time
    const optimal = suggestOptimalSendTime(
      recipient,
      openHistory,
      clickHistory,
      recipient.timezone || 'UTC'
    );

    // Cache the result
    await this.db.saveOptimalTimeCache({
      recipientId: recipient.id,
      email: recipient.email,
      optimalHour: optimal.optimalHour,
      optimalDay: optimal.optimalDay,
      timezone: optimal.timezone,
      confidence: optimal.confidence,
      basedOn: {
        openHistory,
        clickHistory,
        sampleSize: openHistory.length + clickHistory.length,
        lastUpdated: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });

    return optimal;
  }

  /**
   * Start processing queued jobs
   * @param {number} intervalMs - Processing interval in milliseconds
   */
  startProcessing(intervalMs = 60000) {
    if (this.processingIntervalId) {
      console.log('Queue processing already running');
      return;
    }

    console.log(`Starting queue processing (interval: ${intervalMs}ms)`);
    
    this.processingIntervalId = setInterval(async () => {
      if (this.isProcessing) {
        console.log('Previous batch still processing, skipping...');
        return;
      }

      this.isProcessing = true;
      
      try {
        await this.processDueJobs();
      } catch (error) {
        console.error('Error processing queue:', error);
      } finally {
        this.isProcessing = false;
      }
    }, intervalMs);
  }

  /**
   * Stop processing queued jobs
   */
  stopProcessing() {
    if (this.processingIntervalId) {
      clearInterval(this.processingIntervalId);
      this.processingIntervalId = null;
      console.log('Queue processing stopped');
    }
  }

  /**
   * Process jobs that are due for sending
   */
  async processDueJobs() {
    const now = new Date();
    
    // Get all pending jobs that are due
    const dueJobs = await this.db.getDueJobs(now);

    if (dueJobs.length === 0) {
      return;
    }

    console.log(`Processing ${dueJobs.length} due jobs...`);

    // Group by newsletter for batch processing
    const jobsByNewsletter = this.groupJobsByNewsletter(dueJobs);

    for (const [newsletterId, jobs] of Object.entries(jobsByNewsletter)) {
      await this.processBatch(newsletterId, jobs);
    }
  }

  /**
   * Process a batch of jobs for a newsletter
   * @param {string} newsletterId - Newsletter ID
   * @param {Array} jobs - Jobs to process
   */
  async processBatch(newsletterId, jobs) {
    const newsletter = await this.db.getNewsletter(newsletterId);

    if (!newsletter) {
      console.error(`Newsletter ${newsletterId} not found`);
      return;
    }

    // Update newsletter status
    if (newsletter.status === NEWSLETTER_STATUS.SCHEDULED) {
      await this.db.updateNewsletterStatus(newsletterId, NEWSLETTER_STATUS.SENDING);
    }

    // Get batch size and rate limit from newsletter config
    const batchSize = newsletter.queue.batchSize || 100;
    const rateLimit = newsletter.queue.rateLimit || 100; // messages per minute

    // Process in batches respecting rate limits
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(job => this.processJob(job, newsletter))
      );

      // Rate limiting: wait between batches
      if (i + batchSize < jobs.length) {
        const delayMs = (60000 / rateLimit) * batchSize;
        await this.sleep(delayMs);
      }
    }

    // Check if all jobs are complete
    const remainingJobs = await this.db.getPendingJobsCount(newsletterId);
    
    if (remainingJobs === 0) {
      await this.db.updateNewsletterStatus(newsletterId, NEWSLETTER_STATUS.SENT);
      await this.db.updateNewsletter(newsletterId, {
        sentAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });
    }
  }

  /**
   * Process a single job
   * @param {Object} job - Job to process
   * @param {Object} newsletter - Newsletter configuration
   */
  async processJob(job, newsletter) {
    try {
      // Update job status
      await this.db.updateJobStatus(job.id, 'processing');
      job.attemptedAt = new Date().toISOString();

      // Personalize content
      const personalizedContent = this.personalizeContent(
        newsletter.content,
        job
      );

      // Send via appropriate channel
      let result;
      switch (job.channel) {
        case 'email':
          result = await this.emailService.send({
            to: job.recipientEmail,
            subject: personalizedContent.subject,
            html: personalizedContent.body,
            trackingId: job.id
          });
          break;
        
        // Add other channels (SMS, push, etc.) here
        default:
          throw new Error(`Unsupported channel: ${job.channel}`);
      }

      // Update job as sent
      await this.db.updateJobStatus(job.id, 'sent');
      job.sentAt = new Date().toISOString();

      // Update newsletter analytics
      await this.db.incrementNewsletterStat(newsletter.id, 'totalSent');

      console.log(`Job ${job.id} sent successfully`);
    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error.message);

      // Handle retry logic
      await this.handleJobFailure(job, newsletter, error);
    }
  }

  /**
   * Handle job failure with retry logic
   * @param {Object} job - Failed job
   * @param {Object} newsletter - Newsletter configuration
   * @param {Error} error - Error that occurred
   */
  async handleJobFailure(job, newsletter, error) {
    const retryPolicy = newsletter.queue.retryPolicy || {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 60
    };

    job.retryCount = (job.retryCount || 0) + 1;
    job.errorMessage = error.message;

    if (job.retryCount < retryPolicy.maxRetries) {
      // Calculate next retry time with exponential backoff
      const delaySeconds = retryPolicy.initialDelay * Math.pow(
        retryPolicy.backoffMultiplier,
        job.retryCount - 1
      );
      
      const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
      
      await this.db.updateJob(job.id, {
        status: 'pending',
        retryCount: job.retryCount,
        nextRetryAt: nextRetryAt.toISOString(),
        errorMessage: error.message
      });

      console.log(`Job ${job.id} scheduled for retry ${job.retryCount}/${retryPolicy.maxRetries} at ${nextRetryAt}`);
    } else {
      // Max retries exceeded
      await this.db.updateJobStatus(job.id, 'failed');
      await this.db.incrementNewsletterStat(newsletter.id, 'totalFailed');
      
      console.error(`Job ${job.id} failed permanently after ${job.retryCount} retries`);
    }
  }

  /**
   * Helper methods
   */

  validateNewsletter(newsletter) {
    if (!newsletter.title) throw new Error('Newsletter title is required');
    if (!newsletter.content) throw new Error('Newsletter content is required');
    if (!newsletter.channels || newsletter.channels.length === 0) {
      throw new Error('At least one channel is required');
    }
    if (!newsletter.scheduling || !newsletter.scheduling.scheduledAt) {
      throw new Error('Scheduled time is required');
    }
  }

  async getRecipients(recipientConfig) {
    // Mock implementation - replace with actual database queries
    const recipients = [];
    
    // Fetch from lists
    if (recipientConfig.listIds) {
      // recipients.push(...await this.db.getRecipientsByListIds(recipientConfig.listIds));
    }
    
    // Fetch from segments
    if (recipientConfig.segmentIds) {
      // recipients.push(...await this.db.getRecipientsBySegmentIds(recipientConfig.segmentIds));
    }
    
    // Add individual emails
    if (recipientConfig.individualEmails) {
      recipientConfig.individualEmails.forEach(email => {
        recipients.push({ id: email, email, timezone: 'UTC' });
      });
    }
    
    // Remove excluded recipients
    if (recipientConfig.excludeIds) {
      return recipients.filter(r => !recipientConfig.excludeIds.includes(r.id));
    }
    
    return recipients;
  }

  personalizeContent(content, job) {
    // Replace variables like {{name}}, {{email}}, etc.
    let subject = content.subject;
    let body = content.body;
    
    if (content.variables) {
      Object.entries(content.variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, value);
        body = body.replace(placeholder, value);
      });
    }
    
    return { subject, body };
  }

  groupJobsByNewsletter(jobs) {
    return jobs.reduce((acc, job) => {
      if (!acc[job.newsletterId]) {
        acc[job.newsletterId] = [];
      }
      acc[job.newsletterId].push(job);
      return acc;
    }, {});
  }

  isCacheValid(cache) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(cache.updatedAt) > oneWeekAgo;
  }

  calculateNextOptimalTime(cache) {
    const now = new Date();
    const targetDate = new Date(now);
    
    // Move to next occurrence of optimal day
    const daysToAdd = (cache.optimalDay - now.getDay() + 7) % 7;
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    targetDate.setHours(cache.optimalHour, 0, 0, 0);
    
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    return targetDate.toISOString();
  }

  generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = QueueService;
