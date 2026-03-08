# @custom - DropMagic Custom Backend

This directory contains product-specific backend code for DropMagic.

## Features Implemented

### ✅ Product Drop Scheduling (Task #9679)

**Status:** Complete  
**Completed:** 2026-03-08

Users can now schedule product drops with the following capabilities:

#### Core Functionality

1. **Drop Management**
   - Create, update, and delete drops
   - Schedule drops for future release
   - Set optional end dates for time-limited drops
   - Cancel scheduled or live drops
   - Track download counts

2. **Access Control**
   - Public or private drops
   - Email whitelist (specific users)
   - Domain whitelist (e.g., @company.com)
   - Authentication requirements
   - Download limits

3. **Automated Scheduling**
   - Background scheduler automatically transitions drops:
     - `scheduled` → `live` when scheduled time is reached
     - `live` → `ended` when end time is reached
   - Checks every minute for status updates
   - Graceful startup and shutdown

4. **Notifications**
   - Email notifications when drops go live
   - Optional reminder notifications before drop
   - End notifications when drops expire
   - Configurable recipient lists

5. **Status Lifecycle**
   ```
   draft → scheduled → live → ended
                    ↓
                cancelled
   ```

## Structure

```
@custom/
├── README.md                    (this file)
├── index.js                     (entry point)
├── models/
│   └── drop.js                  (Drop database model)
├── routes/
│   └── drops.js                 (API routes)
├── services/
│   ├── dropScheduler.js         (background scheduler)
│   ├── validation.js            (input validation)
│   └── notifications.js         (email notifications)
└── config/
    └── scheduler.js             (scheduler configuration)
```

## API Endpoints

### Public Endpoints

- `GET /api/drops` - List drops (public + user's own)
- `GET /api/drops/:id` - Get drop by ID
- `GET /api/drops/slug/:slug` - Get drop by slug
- `POST /api/drops/:id/download` - Track download (requires access)

### Authenticated Endpoints

- `POST /api/drops` - Create a new drop
- `PATCH /api/drops/:id` - Update a drop (owner only)
- `DELETE /api/drops/:id` - Delete a drop (owner only)
- `POST /api/drops/:id/schedule` - Schedule a draft drop
- `POST /api/drops/:id/cancel` - Cancel a drop

## Usage

### 1. Initialize Backend

```javascript
const express = require('express');
const dropMagic = require('./products/dropmagic/@custom');

const app = express();

// Connect to MongoDB
// await mongoose.connect(process.env.MONGODB_URI);

// Initialize DropMagic backend (registers routes + starts scheduler)
dropMagic.initialize(app);

app.listen(3000);
```

### 2. Create a Drop

```javascript
POST /api/drops
Authorization: Bearer <token>

{
  "name": "Summer Collection 2026",
  "slug": "summer-collection-2026",
  "description": "Exclusive summer designs available for 48 hours",
  "tagline": "Limited edition summer collection",
  "scheduledAt": "2026-06-01T12:00:00Z",
  "endsAt": "2026-06-03T12:00:00Z",
  "isPublic": true,
  "product": {
    "fileIds": ["file_id_1", "file_id_2"],
    "downloadLimit": 1000,
    "requiresAuth": false
  },
  "notifications": {
    "emailList": ["subscribers@example.com"],
    "notifyOnLive": true,
    "reminderMinutes": 60
  }
}
```

### 3. Schedule the Drop

```javascript
POST /api/drops/:id/schedule
Authorization: Bearer <token>

// Response:
{
  "drop": { ... },
  "message": "Drop scheduled successfully"
}
```

### 4. Access a Drop

```javascript
GET /api/drops/slug/summer-collection-2026

// Response (if accessible):
{
  "drop": {
    "name": "Summer Collection 2026",
    "status": "live",
    "isActive": true,
    "product": {
      "fileIds": [...],
      "downloadCount": 123,
      "downloadLimit": 1000
    },
    ...
  }
}
```

### 5. Download Files

```javascript
POST /api/drops/:id/download
Authorization: Bearer <token> (if required)

// Response:
{
  "files": [
    {
      "name": "design_1.png",
      "url": "https://cdn.dropmagic.io/...",
      ...
    }
  ],
  "message": "Download authorized"
}
```

## Drop Model Schema

```javascript
{
  // Core Identity
  name: String (required),
  slug: String (required, unique),
  description: String (required),
  tagline: String (optional),

  // Scheduling
  scheduledAt: Date (required),
  endsAt: Date (optional),

  // Status
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled',
  isPublic: Boolean,

  // Product
  product: {
    fileIds: [ObjectId],
    downloadLimit: Number (null = unlimited),
    downloadCount: Number,
    requiresAuth: Boolean,
    price: {
      amount: Number,
      currency: String
    },
    metadata: Map
  },

  // Access Control
  allowedEmails: [String],
  allowedDomains: [String],

  // Notifications
  notifications: {
    emailList: [String],
    notifyOnLive: Boolean,
    notifyOnEnd: Boolean,
    reminderMinutes: Number (null = no reminder)
  },

  // Owner
  userId: ObjectId (required),

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

## Scheduler

The drop scheduler runs in the background and:

1. **Checks every minute** for drops that need status updates
2. **Activates scheduled drops** when their time arrives
3. **Ends expired drops** when they reach their end date
4. **Sends notifications** as configured
5. **Sends reminders** before drops go live

### Scheduler Control

```javascript
const dropMagic = require('./products/dropmagic/@custom');
const scheduler = dropMagic.getScheduler();

// Check status
const status = scheduler.getStatus();
console.log(status); // { running: true, checkIntervalMs: 60000, ... }

// Manual trigger
await scheduler.triggerCheck();

// Get upcoming drops
const upcoming = await scheduler.getUpcomingDrops(5);

// Get active drops
const active = await scheduler.getActiveDrops(5);

// Stop/start
scheduler.stop();
scheduler.start();
```

## Configuration

Environment variables (in `config/scheduler.js`):

```bash
# Scheduler settings
DROP_CHECK_INTERVAL_MS=60000        # Check interval (default: 60 seconds)
DROP_SCHEDULER_AUTO_START=true      # Auto-start on boot (default: true)
DROP_NOTIFICATIONS_ENABLED=true     # Enable notifications (default: true)

# Email settings (placeholder - integrate with your provider)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your_api_key
EMAIL_FROM=drops@dropmagic.io
EMAIL_FROM_NAME=DropMagic

# Timezone
DEFAULT_TIMEZONE=UTC
```

## Validation

Input validation ensures:

- Required fields are present
- Dates are valid and logical (end > start)
- Slugs are URL-safe
- Emails and domains are valid
- Download limits are non-negative
- Prices are non-negative

## Access Control

Drops can be:

1. **Fully public** - Anyone can access
2. **Public with auth** - Must be logged in
3. **Email-restricted** - Only specific emails
4. **Domain-restricted** - Only specific domains (e.g., @company.com)
5. **Private** - Only owner

Access is checked via `drop.hasAccess(userEmail)` method.

## Security Features

- Owner-only modification and deletion
- Cannot change files or schedule time after drop goes live
- Cannot delete live drops (must cancel first)
- Download limit enforcement
- Authentication requirements
- Access control lists

## Next Steps

### Integration Requirements

1. **File Management Integration**
   - Connect to file storage system
   - Implement `File` model references
   - Generate secure download URLs

2. **Email Service Integration**
   - Replace notification placeholder with real email service
   - Configure SendGrid/AWS SES/similar
   - Design email templates

3. **User Authentication**
   - Implement authentication middleware
   - Connect to user model
   - Session management

4. **Frontend UI**
   - Drop creation form
   - Drop management dashboard
   - Public drop viewing page
   - Download interface

### Potential Enhancements

- [ ] Drop analytics (views, downloads, geographic data)
- [ ] Social sharing integration
- [ ] Drop previews before going live
- [ ] Duplicate/clone drops
- [ ] Bulk operations
- [ ] Drop templates
- [ ] Webhook notifications
- [ ] API rate limiting
- [ ] Admin panel for managing all drops

---

**Product:** DropMagic  
**Feature:** Product Drop Scheduling  
**Status:** Complete (Task #9679)  
**Last Updated:** 2026-03-08
