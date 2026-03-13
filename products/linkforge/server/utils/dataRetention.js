// server/utils/dataRetention.js - GDPR data retention policy
// Task #11203 - Data retention for click_events and password_attempts
//
// Policy:
// - click_events: retain for 90 days, then delete
// - password_attempts: retain for 30 days, then delete
// - Run via cron job or API endpoint

/**
 * Clean up old analytics data per GDPR data retention policy.
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Object} Counts of deleted records
 */
async function cleanupExpiredData(prisma) {
  const now = new Date();

  // Click events: 90 days retention
  const clickCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const deletedClicks = await prisma.clickEvent.deleteMany({
    where: { createdAt: { lt: clickCutoff } }
  });

  // Password attempts: 30 days retention
  const attemptCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const deletedAttempts = await prisma.passwordAttempt.deleteMany({
    where: { createdAt: { lt: attemptCutoff } }
  });

  return {
    clickEventsDeleted: deletedClicks.count,
    passwordAttemptsDeleted: deletedAttempts.count,
    clickCutoffDate: clickCutoff.toISOString(),
    attemptCutoffDate: attemptCutoff.toISOString()
  };
}

/**
 * Delete all data for a specific IP hash (GDPR Article 17 - Right to Erasure).
 * Since IPs are truncated/hashed, this works on the stored values.
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} ipHash - The hashed/truncated IP to purge
 * @returns {Object} Counts of deleted records
 */
async function purgeIPData(prisma, ipHash) {
  const [deletedClicks, deletedAttempts] = await Promise.all([
    prisma.clickEvent.deleteMany({
      where: { ipAddress: ipHash }
    }),
    prisma.passwordAttempt.deleteMany({
      where: { ipAddress: ipHash }
    })
  ]);

  return {
    clickEventsDeleted: deletedClicks.count,
    passwordAttemptsDeleted: deletedAttempts.count
  };
}

/**
 * Export all data for a specific IP (GDPR Article 15 - Right of Access).
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} ipValue - The truncated/hashed IP to look up
 * @returns {Object} All stored data for this IP
 */
async function exportIPData(prisma, ipValue) {
  const [clickEvents, passwordAttempts] = await Promise.all([
    prisma.clickEvent.findMany({
      where: { ipAddress: ipValue },
      select: {
        id: true,
        linkId: true,
        userAgent: true,
        referer: true,
        ipAddress: true,
        country: true,
        city: true,
        createdAt: true
      }
    }),
    prisma.passwordAttempt.findMany({
      where: { ipAddress: ipValue },
      select: {
        id: true,
        linkId: true,
        ipAddress: true,
        success: true,
        createdAt: true
      }
    })
  ]);

  return {
    clickEvents,
    passwordAttempts,
    exportedAt: new Date().toISOString()
  };
}

module.exports = {
  cleanupExpiredData,
  purgeIPData,
  exportIPData
};
