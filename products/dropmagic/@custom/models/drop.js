// models/drop.js - Drop Model Schema

/**
 * Drop Model
 * 
 * Represents a scheduled product drop with timing, visibility, and product details
 */

const mongoose = require('mongoose');

const dropSchema = new mongoose.Schema({
  // Core Identity
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Description & Details
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  tagline: {
    type: String,
    maxlength: 140
  },

  // Scheduling
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },

  endsAt: {
    type: Date,
    default: null, // null = no end date
    validate: {
      validator: function(value) {
        if (!value) return true;
        return value > this.scheduledAt;
      },
      message: 'End date must be after scheduled date'
    }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'live', 'ended', 'cancelled'],
    default: 'draft',
    index: true
  },

  // Visibility
  isPublic: {
    type: Boolean,
    default: false
  },

  // Product Details
  product: {
    fileIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    }],
    
    downloadLimit: {
      type: Number,
      default: null // null = unlimited
    },
    
    downloadCount: {
      type: Number,
      default: 0
    },
    
    requiresAuth: {
      type: Boolean,
      default: false
    },
    
    price: {
      amount: {
        type: Number,
        default: 0 // 0 = free
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
      default: {}
    }
  },

  // Access Control
  allowedEmails: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  allowedDomains: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // Notifications
  notifications: {
    emailList: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    
    notifyOnLive: {
      type: Boolean,
      default: true
    },
    
    notifyOnEnd: {
      type: Boolean,
      default: false
    },
    
    reminderMinutes: {
      type: Number,
      default: null // null = no reminder
    }
  },

  // Owner
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Audit Trail
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  publishedAt: {
    type: Date,
    default: null
  }
});

// Indexes for efficient queries
dropSchema.index({ scheduledAt: 1, status: 1 });
dropSchema.index({ userId: 1, status: 1 });
dropSchema.index({ status: 1, isPublic: 1 });

// Auto-update timestamp
dropSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set publishedAt when going live
  if (this.isModified('status') && this.status === 'live' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Virtual for checking if drop is currently active
dropSchema.virtual('isActive').get(function() {
  const now = new Date();
  
  if (this.status !== 'live') return false;
  if (this.scheduledAt > now) return false;
  if (this.endsAt && this.endsAt < now) return false;
  
  return true;
});

// Virtual for checking if download limit reached
dropSchema.virtual('isDownloadLimitReached').get(function() {
  if (!this.product.downloadLimit) return false;
  return this.product.downloadCount >= this.product.downloadLimit;
});

// Method to check if user has access
dropSchema.methods.hasAccess = function(userEmail) {
  // Public drops with no restrictions
  if (this.isPublic && !this.product.requiresAuth && 
      this.allowedEmails.length === 0 && 
      this.allowedDomains.length === 0) {
    return true;
  }

  // Check auth requirement
  if (this.product.requiresAuth && !userEmail) {
    return false;
  }

  // Check email whitelist
  if (this.allowedEmails.length > 0) {
    return this.allowedEmails.includes(userEmail.toLowerCase());
  }

  // Check domain whitelist
  if (this.allowedDomains.length > 0) {
    const domain = userEmail.split('@')[1];
    return this.allowedDomains.includes(domain.toLowerCase());
  }

  return this.isPublic;
};

// Method to increment download count
dropSchema.methods.incrementDownload = async function() {
  this.product.downloadCount += 1;
  await this.save();
};

// Static method to get drops ready to go live
dropSchema.statics.findReadyToLive = function() {
  const now = new Date();
  
  return this.find({
    status: 'scheduled',
    scheduledAt: { $lte: now }
  });
};

// Static method to get drops ready to end
dropSchema.statics.findReadyToEnd = function() {
  const now = new Date();
  
  return this.find({
    status: 'live',
    endsAt: { $ne: null, $lte: now }
  });
};

// Ensure virtuals are included in JSON
dropSchema.set('toJSON', { virtuals: true });
dropSchema.set('toObject', { virtuals: true });

const Drop = mongoose.model('Drop', dropSchema);

module.exports = Drop;
