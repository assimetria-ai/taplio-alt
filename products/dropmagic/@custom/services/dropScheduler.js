// services/dropScheduler.js - Drop Scheduler Service

const Drop = require('../models/drop');
const { sendDropNotification } = require('./notifications');

/**
 * Drop Scheduler Service
 * 
 * Handles automatic status transitions for scheduled drops:
 * - scheduled → live (when scheduledAt time is reached)
 * - live → ended (when endsAt time is reached)
 */

class DropScheduler {
  constructor() {
    this.intervalId = null;
    this.checkIntervalMs = 60 * 1000; // Check every minute
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('[DropScheduler] Already running');
      return;
    }

    console.log('[DropScheduler] Starting scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.checkScheduledDrops();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkScheduledDrops();
    }, this.checkIntervalMs);

    console.log(`[DropScheduler] Scheduler started (checking every ${this.checkIntervalMs / 1000}s)`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('[DropScheduler] Not running');
      return;
    }

    console.log('[DropScheduler] Stopping scheduler...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('[DropScheduler] Scheduler stopped');
  }

  /**
   * Check for drops that need status updates
   */
  async checkScheduledDrops() {
    try {
      await Promise.all([
        this.activateScheduledDrops(),
        this.endExpiredDrops(),
        this.sendReminders()
      ]);
    } catch (error) {
      console.error('[DropScheduler] Error checking scheduled drops:', error);
    }
  }

  /**
   * Activate drops that have reached their scheduled time
   */
  async activateScheduledDrops() {
    try {
      const dropsToActivate = await Drop.findReadyToLive();

      if (dropsToActivate.length === 0) {
        return;
      }

      console.log(`[DropScheduler] Found ${dropsToActivate.length} drop(s) ready to go live`);

      for (const drop of dropsToActivate) {
        try {
          // Update status
          drop.status = 'live';
          drop.publishedAt = new Date();
          await drop.save();

          console.log(`[DropScheduler] ✅ Activated drop: ${drop.name} (${drop.id})`);

          // Send notifications
          if (drop.notifications.notifyOnLive && drop.notifications.emailList.length > 0) {
            await sendDropNotification({
              drop,
              event: 'live',
              recipients: drop.notifications.emailList
            });
            console.log(`[DropScheduler] 📧 Sent live notifications for drop: ${drop.name}`);
          }
        } catch (error) {
          console.error(`[DropScheduler] Error activating drop ${drop.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[DropScheduler] Error in activateScheduledDrops:', error);
    }
  }

  /**
   * End drops that have reached their end time
   */
  async endExpiredDrops() {
    try {
      const dropsToEnd = await Drop.findReadyToEnd();

      if (dropsToEnd.length === 0) {
        return;
      }

      console.log(`[DropScheduler] Found ${dropsToEnd.length} drop(s) ready to end`);

      for (const drop of dropsToEnd) {
        try {
          // Update status
          drop.status = 'ended';
          await drop.save();

          console.log(`[DropScheduler] ⏹️  Ended drop: ${drop.name} (${drop.id})`);

          // Send notifications
          if (drop.notifications.notifyOnEnd && drop.notifications.emailList.length > 0) {
            await sendDropNotification({
              drop,
              event: 'ended',
              recipients: drop.notifications.emailList
            });
            console.log(`[DropScheduler] 📧 Sent end notifications for drop: ${drop.name}`);
          }
        } catch (error) {
          console.error(`[DropScheduler] Error ending drop ${drop.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[DropScheduler] Error in endExpiredDrops:', error);
    }
  }

  /**
   * Send reminder notifications for upcoming drops
   */
  async sendReminders() {
    try {
      // Find scheduled drops with reminders configured
      const now = new Date();
      
      const dropsWithReminders = await Drop.find({
        status: 'scheduled',
        'notifications.reminderMinutes': { $ne: null },
        'notifications.emailList.0': { $exists: true }
      });

      for (const drop of dropsWithReminders) {
        try {
          const reminderMs = drop.notifications.reminderMinutes * 60 * 1000;
          const reminderTime = new Date(drop.scheduledAt.getTime() - reminderMs);

          // Check if we should send reminder (within 1 minute window)
          const timeDiff = now.getTime() - reminderTime.getTime();
          const shouldSendReminder = timeDiff >= 0 && timeDiff < this.checkIntervalMs;

          if (shouldSendReminder) {
            // Check if reminder was already sent
            // (You might want to add a reminderSentAt field to the schema)
            await sendDropNotification({
              drop,
              event: 'reminder',
              recipients: drop.notifications.emailList,
              minutesUntilDrop: drop.notifications.reminderMinutes
            });

            console.log(`[DropScheduler] 🔔 Sent reminder for drop: ${drop.name}`);
          }
        } catch (error) {
          console.error(`[DropScheduler] Error sending reminder for drop ${drop.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[DropScheduler] Error in sendReminders:', error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.isRunning,
      checkIntervalMs: this.checkIntervalMs,
      nextCheckIn: this.isRunning ? this.checkIntervalMs : null
    };
  }

  /**
   * Manually trigger a check (useful for testing)
   */
  async triggerCheck() {
    console.log('[DropScheduler] Manual check triggered');
    await this.checkScheduledDrops();
  }

  /**
   * Get upcoming drops
   */
  async getUpcomingDrops(limit = 10) {
    return await Drop.find({
      status: 'scheduled',
      scheduledAt: { $gt: new Date() }
    })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .select('name slug scheduledAt endsAt');
  }

  /**
   * Get active drops
   */
  async getActiveDrops(limit = 10) {
    return await Drop.find({
      status: 'live'
    })
    .sort({ scheduledAt: -1 })
    .limit(limit)
    .select('name slug scheduledAt endsAt product.downloadCount product.downloadLimit');
  }
}

// Create singleton instance
const scheduler = new DropScheduler();

module.exports = scheduler;
