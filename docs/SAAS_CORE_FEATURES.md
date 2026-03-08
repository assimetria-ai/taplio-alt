# SaaS Core Features Guide

This template includes production-ready implementations of essential SaaS features:

1. **Email System** - Multi-provider transactional emails with template rendering
2. **File Upload** - Direct-to-cloud uploads with S3/R2/local storage  
3. **Logging & Audit** - Structured application logging and full audit trails

---

## Table of Contents

- [1. Email System](#1-email-system)
  - [Provider Setup](#provider-setup)
  - [Sending Emails](#sending-emails)
  - [Email Templates](#email-templates)
  - [Email Tracking](#email-tracking)
  - [Email Analytics API](#email-analytics-api)
- [2. File Upload System](#2-file-upload-system)
  - [Storage Providers](#storage-providers)
  - [Upload Flow](#upload-flow)
  - [Client Integration](#client-integration)
  - [File Management](#file-management)
- [3. Logging & Audit](#3-logging--audit)
  - [Application Logging](#application-logging)
  - [Audit Trails](#audit-trails)
  - [Audit API](#audit-api)
- [4. Integration Examples](#4-integration-examples)

---

## 1. Email System

### Overview

The email system supports multiple providers with automatic failover:

- **Resend** (native API) - Modern transactional email service
- **SMTP** - Any SMTP provider (SendGrid, Mailgun, Resend SMTP, etc.)
- **Amazon SES** - AWS email service
- **Console** - Development fallback (logs to console)

### Provider Setup

#### Option 1: Resend (Recommended)

```bash
# .env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Your App <noreply@yourdomain.com>"
APP_URL=https://yourdomain.com
APP_NAME="Your App Name"
```

#### Option 2: SMTP (Generic)

```bash
# .env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Your App <noreply@yourdomain.com>"
```

#### Option 3: Amazon SES

```bash
# .env
EMAIL_PROVIDER=ses
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Your App <noreply@yourdomain.com>"
SES_FROM_EMAIL=noreply@yourdomain.com  # Fallback
```

#### Option 4: Console (Development)

```bash
# .env
# No email config needed - emails logged to console
APP_URL=http://localhost:5173
```

### Sending Emails

#### Basic Usage

```javascript
const Email = require('./lib/@system/Email')

// Send verification email
await Email.sendVerificationEmail({
  to: 'user@example.com',
  name: 'Alex Smith',
  token: 'abc123...',
  userId: 42,  // Optional - for tracking
})

// Send password reset
await Email.sendPasswordResetEmail({
  to: 'user@example.com',
  name: 'Alex Smith',
  token: 'xyz789...',
  userId: 42,
})

// Send welcome email
await Email.sendWelcomeEmail({
  to: 'user@example.com',
  name: 'Alex Smith',
  userId: 42,
})

// Send team invitation
await Email.sendInvitationEmail({
  to: 'newuser@example.com',
  inviterName: 'Jordan Lee',
  orgName: 'Acme Corp',
  token: 'inv456...',
  userId: null,  // Invitee not registered yet
})

// Send magic link (passwordless login)
await Email.sendMagicLinkEmail({
  to: 'user@example.com',
  name: 'Alex Smith',
  token: 'ml789...',
  userId: 42,
})

// Send generic notification
await Email.sendNotificationEmail({
  to: 'user@example.com',
  subject: 'Your report is ready',
  title: 'Monthly Report Available',
  body: '<p>Your monthly analytics report has been generated.</p>',
  ctaLabel: 'View Report',
  ctaUrl: 'https://app.example.com/reports/monthly',
  userId: 42,
})
```

#### Custom Email

```javascript
await Email.send({
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<h1>Hello World</h1><p>Custom HTML content</p>',
  text: 'Hello World\n\nCustom plain text content',
  template: 'custom',  // Optional - for tracking
  userId: 42,          // Optional - for tracking
  replyTo: 'support@example.com',
  cc: ['manager@example.com'],
  bcc: ['archive@example.com'],
  attachments: [
    {
      filename: 'report.pdf',
      path: '/tmp/report.pdf',  // or buffer/stream
      contentType: 'application/pdf',
    },
  ],
})
```

### Email Templates

All templates use a consistent design system. Templates are located in:

```
server/src/lib/@system/Email/templates.js
```

#### Available Templates

1. **verification** - Email address verification link
2. **password_reset** - Password reset link
3. **welcome** - Welcome email after registration
4. **invitation** - Team/workspace invitation
5. **magic_link** - Passwordless login link
6. **notification** - Generic notification with optional CTA

#### Customizing Templates

Edit `server/src/lib/@system/Email/templates.js`:

```javascript
function customTemplate({ name, actionUrl }) {
  return baseTemplate({
    title: `Hello ${name}`,
    body: `
      <p>Your custom email content here.</p>
      <p>Click the button below to continue:</p>
    `,
    ctaLabel: 'Continue',
    ctaUrl: actionUrl,
  })
}

module.exports = {
  verification,
  welcome,
  passwordReset,
  invitation,
  magicLink,
  notification,
  customTemplate,  // Add your custom template
}
```

#### Template Preview

Preview templates in your browser:

```bash
# Start server
npm run dev

# Open browser
http://localhost:3001/api/email-logs/preview/verification
http://localhost:3001/api/email-logs/preview/welcome
http://localhost:3001/api/email-logs/preview/password_reset
```

Or use the admin dashboard (requires admin role):
```
http://localhost:5173/app/email-tracking
```

### Email Tracking

All sent emails are automatically logged to the `email_logs` table for analytics and debugging.

#### Database Schema

```sql
CREATE TABLE email_logs (
  id            SERIAL PRIMARY KEY,
  to_address    TEXT NOT NULL,
  subject       TEXT NOT NULL,
  template      TEXT,                    -- 'verification' | 'password_reset' | etc.
  status        TEXT NOT NULL,            -- 'sent' | 'delivered' | 'bounced' | 'failed'
  message_id    TEXT,                     -- Provider message ID
  provider      TEXT,                     -- 'resend' | 'smtp' | 'ses' | 'console'
  error         TEXT,                     -- Error message if failed
  metadata      JSONB,                    -- Extra context
  user_id       INTEGER REFERENCES users(id),
  sent_at       TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

#### Enable Tracking

In your app initialization:

```javascript
// server/src/app.js or server/src/index.js
const Email = require('./lib/@system/Email')
const EmailLogRepo = require('./db/repos/@custom/EmailLogRepo')

// Register callback to log all sent emails
Email.setEmailSentCallback(async (emailData) => {
  await EmailLogRepo.create(emailData)
})
```

### Email Analytics API

All endpoints require admin authentication.

#### List Email Logs

```bash
GET /api/email-logs?status=sent&template=verification&limit=50&offset=0

Response:
{
  "logs": [
    {
      "id": 123,
      "to_address": "user@example.com",
      "subject": "Verify your email address",
      "template": "verification",
      "status": "sent",
      "message_id": "abc123@mail.example.com",
      "provider": "resend",
      "sent_at": "2024-03-08T10:30:00Z",
      "user_id": 42
    }
  ],
  "total": 1523
}
```

#### Email Statistics

```bash
GET /api/email-logs/stats

Response:
{
  "stats": {
    "total": 10523,
    "sent": 10102,
    "delivered": 9856,
    "bounced": 45,
    "failed": 621,
    "last_7_days": 842
  }
}
```

#### Volume by Day

```bash
GET /api/email-logs/volume?days=30

Response:
{
  "volume": [
    { "date": "2024-03-01", "count": 234 },
    { "date": "2024-03-02", "count": 189 },
    ...
  ]
}
```

#### Template Breakdown

```bash
GET /api/email-logs/templates

Response:
{
  "templates": [
    { "template": "verification", "count": 4523 },
    { "template": "password_reset", "count": 892 },
    { "template": "welcome", "count": 2314 },
    ...
  ]
}
```

---

## 2. File Upload System

### Overview

The file upload system supports direct browser-to-storage uploads via presigned URLs. This keeps uploaded files off your application server.

**Supported Storage Providers:**

- **AWS S3** - Industry standard object storage
- **Cloudflare R2** - S3-compatible, zero egress fees
- **Local Filesystem** - Development and self-hosted deployments

### Storage Providers

#### Option 1: AWS S3

```bash
# .env
STORAGE_PROVIDER=s3
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET=your-bucket-name
S3_PUBLIC_URL=https://your-bucket.s3.eu-west-1.amazonaws.com
```

**Required IAM permissions:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### Option 2: Cloudflare R2

```bash
# .env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET=your-bucket-name
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxx.r2.dev
```

#### Option 3: Local Filesystem

```bash
# .env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads
LOCAL_STORAGE_URL=http://localhost:3001/uploads
```

**Note:** For production, serve the `uploads/` directory with a static file server or CDN.

### Upload Flow

#### 1. Request Presigned URL (Server)

```javascript
const Storage = require('./lib/@system/StorageAdapter')

const { url, key, publicUrl, expiresAt } = await Storage.createUploadUrl({
  filename: 'profile.jpg',
  contentType: 'image/jpeg',
  folder: 'avatars',      // Optional - default: 'uploads'
  expiresIn: 300,         // Optional - seconds, default: 300
})

// url: Presigned upload URL (PUT for S3/R2, POST for local)
// key: Storage key for later retrieval (e.g., 'avatars/abc123.jpg')
// publicUrl: Public read URL
// expiresAt: Expiration timestamp
```

#### 2. Upload from Browser (Client)

**For S3/R2:**

```javascript
// Upload directly to presigned URL
const response = await fetch(url, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
})

if (!response.ok) {
  throw new Error('Upload failed')
}

// File is now accessible at: publicUrl
```

**For Local:**

```javascript
// For local storage, URL is a POST endpoint with token
const formData = new FormData()
formData.append('file', file)

const response = await fetch(url, {
  method: 'POST',
  body: file,  // Raw binary for local adapter
})

if (!response.ok) {
  throw new Error('Upload failed')
}
```

#### 3. Confirm Upload (Optional)

Track successful uploads in database:

```javascript
const FileUploadRepo = require('./db/repos/@custom/FileUploadRepo')

await FileUploadRepo.create({
  user_id: req.user.id,
  key,
  filename: 'profile.jpg',
  content_type: 'image/jpeg',
  size_bytes: file.size,
  bucket: process.env.S3_BUCKET,
  status: 'uploaded',
})
```

### Client Integration

#### React Component

```jsx
// client/src/app/components/@system/FileUpload/FileUpload.jsx
import { useState } from 'react'
import { uploadFile } from '../../../lib/storage'

export function FileUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // 1. Get presigned URL from your API
      const response = await fetch('/api/storage/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'uploads',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { url, key, publicUrl } = await response.json()

      // 2. Upload directly to storage
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      // 3. Notify parent component
      onUpload({ key, publicUrl, filename: file.name })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
```

### File Management

#### Delete File

```javascript
const Storage = require('./lib/@system/StorageAdapter')

await Storage.delete(key)

// Also remove from database
await FileUploadRepo.delete(uploadId)
```

#### Generate Download URL

For private files that need temporary access:

```javascript
const { url, expiresAt } = await Storage.createDownloadUrl({
  key: 'private/document.pdf',
  expiresIn: 3600,  // 1 hour
})

// Share this URL - it expires after 1 hour
```

#### Check if File Exists

```javascript
const { exists, size, contentType } = await Storage.exists(key)

if (exists) {
  console.log(`File size: ${size} bytes, type: ${contentType}`)
}
```

#### Storage Health Check

```javascript
const health = await Storage.health()

// {
//   provider: 's3',
//   configured: true,
//   bucket: 'your-bucket-name',
//   region: 'eu-west-1'
// }
```

---

## 3. Logging & Audit

### Application Logging

#### Basic Usage

```javascript
const logger = require('./lib/@system/Logger')

logger.info('User logged in')
logger.debug('Processing request')
logger.warn({ userId: 42 }, 'Rate limit approaching')
logger.error({ err }, 'Payment failed')
```

#### Structured Logging

```javascript
// Add context to every log
logger.info({
  userId: req.user.id,
  action: 'create_post',
  postId: 123,
  duration: 45,
}, 'Post created successfully')

// Output (production):
// {"level":30,"userId":42,"action":"create_post","postId":123,"duration":45,"msg":"Post created successfully"}

// Output (development - pretty printed):
// [10:30:15] INFO: Post created successfully
//   userId: 42
//   action: "create_post"
//   postId: 123
//   duration: 45
```

#### Log Levels

Set `LOG_LEVEL` in `.env`:

- `debug` - Everything (use in development)
- `info` - Informational (default in production)
- `warn` - Warnings only
- `error` - Errors only
- `fatal` - Fatal errors only

```bash
# .env (development)
LOG_LEVEL=debug
NODE_ENV=development

# .env (production)
LOG_LEVEL=info
NODE_ENV=production
```

#### Custom Service Name

```bash
# .env
SERVICE_NAME=api-server
```

#### Request Logging

The template automatically logs all HTTP requests:

```javascript
// Logs: GET /api/users 200 45ms
```

Disable for specific routes:

```javascript
app.use('/api/health', (req, res) => {
  req.log.silent = true  // Don't log this endpoint
  res.json({ ok: true })
})
```

### Audit Trails

Track every data change with full before/after snapshots.

#### Database Schema

```sql
CREATE TABLE audit_logs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  actor_email   TEXT,                -- Snapshot of email at time
  action        TEXT NOT NULL,       -- 'create' | 'update' | 'delete' | 'login'
  resource_type TEXT NOT NULL,       -- 'user' | 'post' | 'payment'
  resource_id   TEXT,                -- Resource PK
  old_data      JSONB,               -- Before (null for creates)
  new_data      JSONB,               -- After (null for deletes)
  ip_address    TEXT,
  user_agent    TEXT,
  metadata      JSONB,               -- Extra context
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

#### Creating Audit Logs

```javascript
const AuditLogRepo = require('./db/repos/@custom/AuditLogRepo')

// CREATE
await AuditLogRepo.create({
  user_id: req.user.id,
  actor_email: req.user.email,
  action: 'create',
  resource_type: 'post',
  resource_id: String(newPost.id),
  old_data: null,
  new_data: newPost,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  metadata: { route: req.path },
})

// UPDATE
await AuditLogRepo.create({
  user_id: req.user.id,
  actor_email: req.user.email,
  action: 'update',
  resource_type: 'post',
  resource_id: String(post.id),
  old_data: oldPost,  // Before update
  new_data: updatedPost,  // After update
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
})

// DELETE
await AuditLogRepo.create({
  user_id: req.user.id,
  actor_email: req.user.email,
  action: 'delete',
  resource_type: 'post',
  resource_id: String(post.id),
  old_data: post,  // What was deleted
  new_data: null,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
})

// LOGIN
await AuditLogRepo.create({
  user_id: user.id,
  actor_email: user.email,
  action: 'login',
  resource_type: 'session',
  resource_id: null,
  old_data: null,
  new_data: { method: 'password', success: true },
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
})
```

#### Audit Middleware

Automatically audit all model changes:

```javascript
// Example middleware for automatic audit logging
function auditMiddleware(resourceType) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res)
    
    res.json = function (data) {
      // Capture the response before sending
      if (req.method !== 'GET' && data) {
        AuditLogRepo.create({
          user_id: req.user?.id,
          actor_email: req.user?.email,
          action: req.method === 'POST' ? 'create' : 
                  req.method === 'PATCH' ? 'update' : 
                  req.method === 'DELETE' ? 'delete' : 'unknown',
          resource_type: resourceType,
          resource_id: req.params.id ?? data.id,
          old_data: req.originalData ?? null,  // Set this before update
          new_data: data,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        }).catch(err => logger.error({ err }, 'Audit log failed'))
      }
      
      return originalJson(data)
    }
    
    next()
  }
}

// Usage
router.patch('/api/posts/:id', auditMiddleware('post'), async (req, res) => {
  const existing = await postsRepo.findById(req.params.id)
  req.originalData = existing  // Store for audit
  
  const updated = await postsRepo.update(req.params.id, req.body)
  res.json(updated)
})
```

### Audit API

All endpoints require admin authentication.

#### List Audit Logs

```bash
GET /api/audit-logs?user_id=42&action=update&resource_type=post&limit=50

Response:
{
  "logs": [
    {
      "id": 789,
      "user_id": 42,
      "actor_email": "alex@example.com",
      "action": "update",
      "resource_type": "post",
      "resource_id": "123",
      "old_data": { "title": "Old Title", "status": "draft" },
      "new_data": { "title": "New Title", "status": "published" },
      "ip_address": "203.0.113.42",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-03-08T10:30:00Z"
    }
  ],
  "total": 1523
}
```

#### Get Audit Log by ID

```bash
GET /api/audit-logs/789

Response:
{
  "log": { ... }
}
```

#### Resource History

```bash
GET /api/audit-logs/resource/post/123

Response:
{
  "logs": [
    { "action": "create", "created_at": "2024-03-01T08:00:00Z", ... },
    { "action": "update", "created_at": "2024-03-02T09:15:00Z", ... },
    { "action": "update", "created_at": "2024-03-08T10:30:00Z", ... }
  ]
}
```

#### User Activity

```bash
GET /api/audit-logs/user/42?limit=100

Response:
{
  "logs": [
    { "action": "login", "created_at": "2024-03-08T08:00:00Z", ... },
    { "action": "create", "resource_type": "post", ... },
    { "action": "update", "resource_type": "post", ... }
  ]
}
```

---

## 4. Integration Examples

### Complete Registration Flow

```javascript
const Email = require('./lib/@system/Email')
const AuditLogRepo = require('./db/repos/@custom/AuditLogRepo')

router.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    // 1. Create user
    const user = await usersRepo.create({
      email,
      password_hash: await hashPassword(password),
      name,
    })
    
    // 2. Send verification email
    const token = await generateEmailToken(user.id)
    await Email.sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
      userId: user.id,
    })
    
    // 3. Audit log
    await AuditLogRepo.create({
      user_id: user.id,
      actor_email: user.email,
      action: 'create',
      resource_type: 'user',
      resource_id: String(user.id),
      old_data: null,
      new_data: { id: user.id, email: user.email, name: user.name },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      metadata: { method: 'email_password' },
    })
    
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
})
```

### Profile Update with Avatar Upload

```javascript
router.patch('/api/user/profile', authenticate, async (req, res, next) => {
  try {
    const { name, bio, avatar_key } = req.body
    
    const oldProfile = await usersRepo.findById(req.user.id)
    
    // Update profile
    const updated = await usersRepo.update(req.user.id, {
      name,
      bio,
      avatar_key,
    })
    
    // If avatar changed, clean up old one
    if (avatar_key && oldProfile.avatar_key && avatar_key !== oldProfile.avatar_key) {
      await Storage.delete(oldProfile.avatar_key)
    }
    
    // Audit log
    await AuditLogRepo.create({
      user_id: req.user.id,
      actor_email: req.user.email,
      action: 'update',
      resource_type: 'user',
      resource_id: String(req.user.id),
      old_data: { name: oldProfile.name, bio: oldProfile.bio },
      new_data: { name: updated.name, bio: updated.bio },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    })
    
    res.json({ user: updated })
  } catch (err) {
    next(err)
  }
})
```

### Team Invitation with Email

```javascript
router.post('/api/teams/:teamId/invite', authenticate, async (req, res, next) => {
  try {
    const { email, role } = req.body
    const team = await teamsRepo.findById(req.params.teamId)
    
    // Generate invitation token
    const token = await generateInvitationToken({
      team_id: team.id,
      email,
      role,
      inviter_id: req.user.id,
    })
    
    // Send invitation email
    await Email.sendInvitationEmail({
      to: email,
      inviterName: req.user.name,
      orgName: team.name,
      token,
      userId: null,  // Invitee not a user yet
    })
    
    // Audit log
    await AuditLogRepo.create({
      user_id: req.user.id,
      actor_email: req.user.email,
      action: 'create',
      resource_type: 'invitation',
      resource_id: token,
      old_data: null,
      new_data: { team_id: team.id, email, role },
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    })
    
    res.json({ invited: true, email })
  } catch (err) {
    next(err)
  }
})
```

---

## Summary

This template includes production-ready implementations of:

- ✅ **Email System**: Multi-provider transactional emails with tracking
- ✅ **File Upload**: Direct-to-cloud uploads (S3/R2/local)
- ✅ **Logging**: Structured application logging (Pino)
- ✅ **Audit Trails**: Complete change history with before/after snapshots

All features are:
- 🚀 Production-ready
- 📊 Analytics-enabled
- 🔒 Security-hardened
- 📝 Fully documented
- 🧪 Testable

For more details, see:
- Email templates: `server/src/lib/@system/Email/templates.js`
- Storage adapters: `server/src/lib/@system/StorageAdapter/`
- Audit repository: `server/src/db/repos/@custom/AuditLogRepo.js`
- Email logs repository: `server/src/db/repos/@custom/EmailLogRepo.js`
