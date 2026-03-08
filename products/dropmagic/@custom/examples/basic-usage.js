// examples/basic-usage.js - Drop Scheduling Basic Usage Examples

/**
 * Example usage of the Drop Scheduling API
 * 
 * This file demonstrates how to create, schedule, and manage drops
 * programmatically using the DropMagic backend.
 */

const Drop = require('../models/drop');
const dropScheduler = require('../services/dropScheduler');

// ============================================================================
// Example 1: Create a Simple Public Drop
// ============================================================================

async function createPublicDrop() {
  const drop = new Drop({
    name: 'My First Drop',
    slug: 'my-first-drop',
    description: 'This is a test drop with some cool files',
    tagline: 'Free resources for everyone',
    
    // Schedule for 1 hour from now
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
    
    // End after 24 hours
    endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
    
    isPublic: true,
    
    product: {
      fileIds: [], // Add your file IDs here
      downloadLimit: null, // Unlimited downloads
      requiresAuth: false
    },
    
    userId: 'user_id_here' // Replace with actual user ID
  });

  await drop.save();
  console.log('✅ Created public drop:', drop.id);
  return drop;
}

// ============================================================================
// Example 2: Create a Private Drop with Email Whitelist
// ============================================================================

async function createPrivateDrop() {
  const drop = new Drop({
    name: 'Exclusive VIP Drop',
    slug: 'vip-drop-2026',
    description: 'Exclusive content for VIP members only',
    
    scheduledAt: new Date('2026-06-01T12:00:00Z'),
    endsAt: new Date('2026-06-03T12:00:00Z'),
    
    isPublic: false,
    
    product: {
      fileIds: [],
      downloadLimit: 100, // Only 100 downloads allowed
      requiresAuth: true
    },
    
    // Only these emails can access
    allowedEmails: [
      'vip1@example.com',
      'vip2@example.com',
      'vip3@example.com'
    ],
    
    notifications: {
      emailList: [
        'vip1@example.com',
        'vip2@example.com',
        'vip3@example.com'
      ],
      notifyOnLive: true,
      notifyOnEnd: true,
      reminderMinutes: 60 // Send reminder 1 hour before
    },
    
    userId: 'user_id_here'
  });

  await drop.save();
  console.log('✅ Created private drop:', drop.id);
  return drop;
}

// ============================================================================
// Example 3: Create a Team Drop (Domain-Based Access)
// ============================================================================

async function createTeamDrop() {
  const drop = new Drop({
    name: 'Team Resources Q2 2026',
    slug: 'team-resources-q2-2026',
    description: 'Internal resources for the team',
    
    scheduledAt: new Date('2026-04-01T09:00:00Z'),
    // No end date - available indefinitely
    
    isPublic: false,
    
    product: {
      fileIds: [],
      requiresAuth: true
    },
    
    // Anyone from @company.com can access
    allowedDomains: [
      'company.com'
    ],
    
    notifications: {
      emailList: ['team@company.com'],
      notifyOnLive: true
    },
    
    userId: 'user_id_here'
  });

  await drop.save();
  console.log('✅ Created team drop:', drop.id);
  return drop;
}

// ============================================================================
// Example 4: Schedule a Draft Drop
// ============================================================================

async function scheduleDrop(dropId) {
  const drop = await Drop.findById(dropId);
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  if (drop.status !== 'draft') {
    throw new Error('Only draft drops can be scheduled');
  }
  
  if (drop.scheduledAt <= new Date()) {
    throw new Error('Scheduled time must be in the future');
  }
  
  drop.status = 'scheduled';
  await drop.save();
  
  console.log('✅ Drop scheduled:', drop.name);
  console.log('   Goes live at:', drop.scheduledAt);
  
  return drop;
}

// ============================================================================
// Example 5: Check Drop Access
// ============================================================================

async function checkAccess(dropId, userEmail) {
  const drop = await Drop.findById(dropId);
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  const hasAccess = drop.hasAccess(userEmail);
  
  console.log(`User ${userEmail} has access to "${drop.name}":`, hasAccess);
  return hasAccess;
}

// ============================================================================
// Example 6: Track Download
// ============================================================================

async function trackDownload(dropId) {
  const drop = await Drop.findById(dropId).populate('product.fileIds');
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  if (!drop.isActive) {
    throw new Error('Drop is not currently active');
  }
  
  if (drop.isDownloadLimitReached) {
    throw new Error('Download limit reached');
  }
  
  // Increment download count
  await drop.incrementDownload();
  
  console.log('✅ Download tracked');
  console.log(`   Total downloads: ${drop.product.downloadCount}`);
  
  if (drop.product.downloadLimit) {
    const remaining = drop.product.downloadLimit - drop.product.downloadCount;
    console.log(`   Remaining: ${remaining}`);
  }
  
  return drop.product.fileIds;
}

// ============================================================================
// Example 7: Get Scheduler Status and Upcoming Drops
// ============================================================================

async function getSchedulerInfo() {
  // Get scheduler status
  const status = dropScheduler.getStatus();
  console.log('📊 Scheduler Status:', status);
  
  // Get upcoming drops
  const upcoming = await dropScheduler.getUpcomingDrops(5);
  console.log('\n📅 Upcoming Drops:');
  upcoming.forEach(drop => {
    console.log(`   - ${drop.name} (${drop.scheduledAt})`);
  });
  
  // Get active drops
  const active = await dropScheduler.getActiveDrops(5);
  console.log('\n🔴 Active Drops:');
  active.forEach(drop => {
    console.log(`   - ${drop.name} (${drop.product.downloadCount} downloads)`);
  });
}

// ============================================================================
// Example 8: Cancel a Drop
// ============================================================================

async function cancelDrop(dropId) {
  const drop = await Drop.findById(dropId);
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  if (!['scheduled', 'live'].includes(drop.status)) {
    throw new Error('Can only cancel scheduled or live drops');
  }
  
  drop.status = 'cancelled';
  await drop.save();
  
  console.log('✅ Drop cancelled:', drop.name);
  return drop;
}

// ============================================================================
// Example 9: Update Drop Before Going Live
// ============================================================================

async function updateDrop(dropId, updates) {
  const drop = await Drop.findById(dropId);
  
  if (!drop) {
    throw new Error('Drop not found');
  }
  
  // Can't modify files or schedule after going live
  if (drop.status === 'live') {
    if (updates.scheduledAt || updates.product?.fileIds) {
      throw new Error('Cannot modify schedule or files after drop is live');
    }
  }
  
  Object.assign(drop, updates);
  await drop.save();
  
  console.log('✅ Drop updated:', drop.name);
  return drop;
}

// ============================================================================
// Running Examples
// ============================================================================

async function runExamples() {
  try {
    console.log('🚀 DropMagic Scheduling Examples\n');
    
    // Note: These examples require a MongoDB connection and proper user IDs
    // Uncomment and modify as needed for your setup
    
    // const drop1 = await createPublicDrop();
    // await scheduleDrop(drop1.id);
    
    // const drop2 = await createPrivateDrop();
    
    // await checkAccess(drop1.id, 'user@example.com');
    
    // await getSchedulerInfo();
    
    console.log('\n✅ Examples completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export for use in other modules
module.exports = {
  createPublicDrop,
  createPrivateDrop,
  createTeamDrop,
  scheduleDrop,
  checkAccess,
  trackDownload,
  getSchedulerInfo,
  cancelDrop,
  updateDrop,
  runExamples
};

// Run if executed directly
if (require.main === module) {
  runExamples();
}
