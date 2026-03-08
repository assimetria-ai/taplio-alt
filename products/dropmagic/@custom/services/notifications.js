// services/notifications.js - Drop Notification Service

/**
 * Send notifications for drop events
 * 
 * This is a placeholder implementation that logs notifications.
 * In production, integrate with email service (SendGrid, AWS SES, etc.)
 */

async function sendDropNotification({ drop, event, recipients, minutesUntilDrop }) {
  try {
    // Build notification content based on event type
    const notification = buildNotificationContent({ drop, event, minutesUntilDrop });

    // In production, send actual emails
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // await sgMail.sendMultiple({
    //   to: recipients,
    //   from: 'drops@dropmagic.io',
    //   subject: notification.subject,
    //   html: notification.html
    // });

    // For now, just log
    console.log(`[Notifications] Would send ${event} notification for drop "${drop.name}"`);
    console.log(`[Notifications] Recipients: ${recipients.join(', ')}`);
    console.log(`[Notifications] Subject: ${notification.subject}`);
    console.log(`[Notifications] Preview: ${notification.preview}`);

    return { success: true, sent: recipients.length };
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Build notification content based on event type
 */
function buildNotificationContent({ drop, event, minutesUntilDrop }) {
  const dropUrl = `https://dropmagic.io/drops/${drop.slug}`;

  switch (event) {
    case 'live':
      return {
        subject: `🎉 ${drop.name} is now live!`,
        preview: `${drop.name} is now available for download`,
        html: `
          <h1>🎉 ${drop.name} is now live!</h1>
          <p>${drop.description}</p>
          <p><strong>Available now:</strong> <a href="${dropUrl}">${dropUrl}</a></p>
          ${drop.endsAt ? `<p><em>Drop ends: ${formatDate(drop.endsAt)}</em></p>` : ''}
          <p>Get it while you can!</p>
        `
      };

    case 'reminder':
      return {
        subject: `⏰ Reminder: ${drop.name} drops in ${minutesUntilDrop} minutes`,
        preview: `${drop.name} will be available soon`,
        html: `
          <h1>⏰ Reminder: Drop starting soon!</h1>
          <p><strong>${drop.name}</strong> will be available in ${minutesUntilDrop} minutes.</p>
          <p>${drop.description}</p>
          <p><strong>Scheduled for:</strong> ${formatDate(drop.scheduledAt)}</p>
          <p><a href="${dropUrl}">View drop details</a></p>
        `
      };

    case 'ended':
      return {
        subject: `${drop.name} has ended`,
        preview: `This drop is no longer available`,
        html: `
          <h1>${drop.name} has ended</h1>
          <p>This drop is no longer available for download.</p>
          <p><strong>Total downloads:</strong> ${drop.product.downloadCount}</p>
          <p>Thanks for participating!</p>
        `
      };

    default:
      return {
        subject: `Update: ${drop.name}`,
        preview: drop.description,
        html: `
          <h1>${drop.name}</h1>
          <p>${drop.description}</p>
          <p><a href="${dropUrl}">View drop</a></p>
        `
      };
  }
}

/**
 * Format date for display
 */
function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

/**
 * Send test notification (for debugging)
 */
async function sendTestNotification(email) {
  const testDrop = {
    name: 'Test Drop',
    slug: 'test-drop',
    description: 'This is a test notification',
    scheduledAt: new Date(),
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    product: {
      downloadCount: 42
    }
  };

  return await sendDropNotification({
    drop: testDrop,
    event: 'live',
    recipients: [email]
  });
}

module.exports = {
  sendDropNotification,
  sendTestNotification
};
