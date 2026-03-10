// @custom/routes/newsletter.js - Newsletter Scheduling API Routes

/**
 * Newsletter Scheduling API
 * RESTful endpoints for creating, managing, and scheduling newsletters
 */

const express = require('express');
const router = express.Router();
const { NEWSLETTER_STATUS, TIMEZONE_STRATEGY } = require('../models/newsletter');
const {
  isValidTimezone,
  suggestOptimalSendTime,
  getIndustryBestPractices
} = require('../utils/timezone');

// Middleware (authentication, validation, etc.)
const authenticate = require('../middleware/auth'); // To be implemented
const validate = require('../middleware/validation'); // To be implemented

/**
 * POST /api/newsletters
 * Create a new newsletter draft
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      content,
      channels,
      recipients,
      scheduling,
      queue,
      tags
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!content || !content.subject || !content.body) {
      return res.status(400).json({ error: 'Content (subject and body) is required' });
    }

    if (!channels || channels.length === 0) {
      return res.status(400).json({ error: 'At least one channel is required' });
    }

    // Create newsletter draft
    const newsletter = {
      id: generateId(),
      userId: req.user.id,
      workspaceId: req.user.workspaceId,
      title,
      content,
      channels,
      recipients: recipients || {
        listIds: [],
        segmentIds: [],
        individualEmails: [],
        excludeIds: [],
        totalCount: 0
      },
      scheduling: scheduling || {
        strategy: TIMEZONE_STRATEGY.SENDER,
        timezone: req.user.timezone || 'UTC',
        sendWindow: null
      },
      queue: queue || {
        priority: 5,
        batchSize: 100,
        rateLimit: 100,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          initialDelay: 60
        }
      },
      status: NEWSLETTER_STATUS.DRAFT,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.id,
      tags: tags || []
    };

    // Save to database
    const saved = await req.db.saveNewsletter(newsletter);

    res.status(201).json({
      success: true,
      newsletter: saved
    });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ error: 'Failed to create newsletter' });
  }
});

/**
 * POST /api/newsletters/:id/schedule
 * Schedule a newsletter for sending
 */
router.post('/:id/schedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, strategy, timezone, sendWindow } = req.body;

    // Get newsletter
    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    // Check ownership
    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Validate scheduling parameters
    if (!scheduledAt) {
      return res.status(400).json({ error: 'scheduledAt is required' });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledAt date' });
    }

    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'scheduledAt must be in the future' });
    }

    if (timezone && !isValidTimezone(timezone)) {
      return res.status(400).json({ error: 'Invalid timezone' });
    }

    // Update scheduling configuration
    newsletter.scheduling = {
      ...newsletter.scheduling,
      scheduledAt: scheduledDate.toISOString(),
      strategy: strategy || TIMEZONE_STRATEGY.SENDER,
      timezone: timezone || newsletter.scheduling.timezone || 'UTC',
      sendWindow: sendWindow || newsletter.scheduling.sendWindow
    };

    // Schedule the newsletter
    const result = await req.queueService.scheduleNewsletter(newsletter);

    res.json({
      success: true,
      message: 'Newsletter scheduled successfully',
      newsletter: result.newsletter,
      jobsCreated: result.jobsCreated,
      estimatedSendTime: result.estimatedSendTime
    });
  } catch (error) {
    console.error('Error scheduling newsletter:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule newsletter' });
  }
});

/**
 * POST /api/newsletters/:id/send-now
 * Send newsletter immediately
 */
router.post('/:id/send-now', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Set scheduling to now
    newsletter.scheduling = {
      ...newsletter.scheduling,
      scheduledAt: new Date().toISOString(),
      strategy: TIMEZONE_STRATEGY.SENDER
    };

    // Schedule immediately
    const result = await req.queueService.scheduleNewsletter(newsletter);

    res.json({
      success: true,
      message: 'Newsletter queued for immediate sending',
      newsletter: result.newsletter,
      jobsCreated: result.jobsCreated
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

/**
 * GET /api/newsletters/:id/optimal-time
 * Get optimal send time suggestions
 */
router.get('/:id/optimal-time', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get recipient sample for analysis
    const recipients = await req.queueService.getRecipients(newsletter.recipients);
    
    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients configured' });
    }

    // Get optimal times for a sample of recipients
    const sampleSize = Math.min(recipients.length, 10);
    const sample = recipients.slice(0, sampleSize);

    const suggestions = await Promise.all(
      sample.map(async (recipient) => {
        const openHistory = await req.db.getOpenHistory(recipient.id);
        const clickHistory = await req.db.getClickHistory(recipient.id);

        return {
          recipientId: recipient.id,
          email: recipient.email,
          ...suggestOptimalSendTime(
            recipient,
            openHistory,
            clickHistory,
            recipient.timezone || 'UTC'
          )
        };
      })
    );

    // Calculate aggregate optimal time
    const aggregateOptimal = calculateAggregateOptimalTime(suggestions);

    res.json({
      success: true,
      optimalTime: aggregateOptimal,
      recipientSamples: suggestions,
      sampleSize,
      totalRecipients: recipients.length
    });
  } catch (error) {
    console.error('Error calculating optimal time:', error);
    res.status(500).json({ error: 'Failed to calculate optimal send time' });
  }
});

/**
 * GET /api/newsletters/:id
 * Get newsletter details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      newsletter
    });
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter' });
  }
});

/**
 * GET /api/newsletters
 * List all newsletters for the user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const filters = {
      userId: req.user.id
    };

    if (status) {
      filters.status = status;
    }

    const newsletters = await req.db.getNewsletters(filters, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await req.db.countNewsletters(filters);

    res.json({
      success: true,
      newsletters,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + newsletters.length < total
      }
    });
  } catch (error) {
    console.error('Error listing newsletters:', error);
    res.status(500).json({ error: 'Failed to list newsletters' });
  }
});

/**
 * PUT /api/newsletters/:id
 * Update newsletter
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Don't allow updating already sent newsletters
    if (newsletter.status === NEWSLETTER_STATUS.SENT) {
      return res.status(400).json({ error: 'Cannot update sent newsletter' });
    }

    // Update allowed fields
    const updated = await req.db.updateNewsletter(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      newsletter: updated
    });
  } catch (error) {
    console.error('Error updating newsletter:', error);
    res.status(500).json({ error: 'Failed to update newsletter' });
  }
});

/**
 * DELETE /api/newsletters/:id
 * Cancel/delete newsletter
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // If scheduled or queued, cancel jobs
    if ([NEWSLETTER_STATUS.SCHEDULED, NEWSLETTER_STATUS.QUEUED].includes(newsletter.status)) {
      await req.db.cancelScheduledJobs(id);
      await req.db.updateNewsletterStatus(id, NEWSLETTER_STATUS.CANCELLED);
      
      res.json({
        success: true,
        message: 'Newsletter cancelled'
      });
    } else if (newsletter.status === NEWSLETTER_STATUS.DRAFT) {
      // Delete draft
      await req.db.deleteNewsletter(id);
      
      res.json({
        success: true,
        message: 'Newsletter deleted'
      });
    } else {
      res.status(400).json({ 
        error: 'Cannot delete newsletter in current status',
        status: newsletter.status
      });
    }
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    res.status(500).json({ error: 'Failed to delete newsletter' });
  }
});

/**
 * GET /api/newsletters/:id/analytics
 * Get newsletter analytics
 */
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await req.db.getNewsletter(id);

    if (!newsletter) {
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    if (newsletter.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get detailed analytics
    const analytics = await req.db.getNewsletterAnalytics(id);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Helper functions
 */

function generateId() {
  return `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateAggregateOptimalTime(suggestions) {
  if (suggestions.length === 0) {
    return getIndustryBestPractices('UTC');
  }

  // Calculate weighted average based on confidence
  let totalConfidence = 0;
  let weightedHourSum = 0;
  let weightedDaySum = 0;

  suggestions.forEach(s => {
    totalConfidence += s.confidence;
    weightedHourSum += s.optimalHour * s.confidence;
    weightedDaySum += s.optimalDay * s.confidence;
  });

  const avgHour = Math.round(weightedHourSum / totalConfidence);
  const avgDay = Math.round(weightedDaySum / totalConfidence);
  const avgConfidence = totalConfidence / suggestions.length;

  // Find next occurrence
  const now = new Date();
  const targetDate = new Date(now);
  const daysToAdd = (avgDay - now.getDay() + 7) % 7;
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  targetDate.setHours(avgHour, 0, 0, 0);

  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  return {
    recommendedTime: targetDate.toISOString(),
    confidence: parseFloat(avgConfidence.toFixed(2)),
    reasoning: `Aggregated from ${suggestions.length} recipient patterns`,
    basedOn: ['recipient_activity', 'historical_opens', 'aggregated_analysis'],
    optimalHour: avgHour,
    optimalDay: avgDay
  };
}

module.exports = router;
