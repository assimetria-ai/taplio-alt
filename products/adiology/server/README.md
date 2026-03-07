# Adiology — Server Application (Backend)

**Status:** 🚧 Not Yet Implemented  
**Framework:** TBD (Node.js/Express recommended)  
**Type:** Main Application Backend

---

## Overview

This directory will contain the main Adiology application backend — the server-side API and business logic for the radio streaming and podcast platform.

**Note:** Basic backend bootstrap structure exists in `../@custom/`, but the main application backend will be implemented here.

---

## Planned Features

### Core API Endpoints

1. **Authentication & Authorization**
   - User registration and login
   - OAuth integration (optional)
   - JWT token management
   - Role-based access control (creator/listener)

2. **Broadcasting API**
   - Live stream management
   - Stream key generation
   - RTMP server integration
   - Broadcast scheduling

3. **Podcast Management**
   - Episode upload and storage
   - Metadata management
   - RSS feed generation
   - CDN integration

4. **Audio Processing**
   - Transcoding and optimization
   - Quality adjustment
   - Format conversion
   - Storage management

5. **Analytics & Insights**
   - Listener statistics
   - Geographic data
   - Engagement metrics
   - Export functionality

---

## Architecture (Planned)

### Technology Stack (Recommended)

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (primary) + Redis (caching)
- **Storage:** S3-compatible (audio files)
- **Streaming:** RTMP server / WebRTC
- **Queue:** Bull / BullMQ (background jobs)
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.IO or WebSockets

### Directory Structure (Proposed)

```
server/
├── src/
│   ├── api/             — API routes
│   │   ├── auth/
│   │   ├── broadcast/
│   │   ├── podcasts/
│   │   ├── analytics/
│   │   └── users/
│   ├── middleware/      — Express middleware
│   ├── models/          — Database models
│   ├── services/        — Business logic
│   ├── jobs/            — Background jobs
│   ├── streaming/       — Streaming server logic
│   ├── utils/           — Utility functions
│   ├── config/          — Configuration
│   └── app.js           — Express app setup
├── migrations/          — Database migrations
├── seeds/               — Database seeds
├── tests/               — Server tests
├── scripts/             — Utility scripts
├── package.json
├── .env.example         — Environment variables template
└── README.md            — This file
```

---

## API Design (Planned)

### Authentication

```
POST   /api/auth/register      — Register new user
POST   /api/auth/login         — Login user
POST   /api/auth/logout        — Logout user
GET    /api/auth/me            — Get current user
POST   /api/auth/refresh       — Refresh token
```

### Broadcasting

```
GET    /api/broadcast          — List user's broadcasts
POST   /api/broadcast          — Create new broadcast
GET    /api/broadcast/:id      — Get broadcast details
PATCH  /api/broadcast/:id      — Update broadcast
DELETE /api/broadcast/:id      — Delete broadcast
POST   /api/broadcast/:id/live — Start live stream
POST   /api/broadcast/:id/stop — Stop live stream
GET    /api/broadcast/:id/key  — Get stream key
```

### Podcasts

```
GET    /api/podcasts           — List podcasts
POST   /api/podcasts           — Create podcast show
GET    /api/podcasts/:id       — Get podcast details
PATCH  /api/podcasts/:id       — Update podcast
DELETE /api/podcasts/:id       — Delete podcast
POST   /api/podcasts/:id/episodes — Upload episode
GET    /api/podcasts/:id/rss   — Get RSS feed
```

### Analytics

```
GET    /api/analytics/overview — Get overview stats
GET    /api/analytics/listeners — Get listener data
GET    /api/analytics/geographic — Get geographic breakdown
GET    /api/analytics/engagement — Get engagement metrics
```

---

## Database Schema (Planned)

### Core Tables

- **users** — User accounts (creators and listeners)
- **broadcasts** — Radio broadcast configurations
- **podcasts** — Podcast show metadata
- **episodes** — Podcast episode details
- **streams** — Active streaming sessions
- **analytics** — Listener analytics data
- **subscriptions** — User subscriptions

### Relationships

- Users → Broadcasts (one-to-many)
- Users → Podcasts (one-to-many)
- Podcasts → Episodes (one-to-many)
- Broadcasts → Analytics (one-to-many)

---

## Environment Configuration

### Required Environment Variables

```bash
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/adiology
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Storage (S3-compatible)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=adiology-audio
AWS_REGION=us-east-1

# Streaming
RTMP_SERVER_URL=rtmp://localhost:1935
RTMP_APP_NAME=live

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Analytics
ANALYTICS_ENABLED=true
```

---

## Getting Started (When Implemented)

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- S3-compatible storage (AWS S3, Minio, etc.)

### Development Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev

# Run tests
npm test

# Start production server
npm start
```

---

## Integration Points

### Frontend Client

- Main application: `../client/`
- Landing page: `../landing/`

### External Services

- S3-compatible storage for audio files
- RTMP server for live streaming
- Email service for notifications
- Analytics service (optional)

### Real-time Features

- WebSocket server for live updates
- Listener count broadcasting
- Stream status notifications

---

## Current Status

**Development Stage:** Not Started  
**Priority:** High (main application)  
**Dependencies:** Database, Storage, RTMP server

### Implementation Checklist

- [ ] Initialize Node.js project
- [ ] Set up Express server
- [ ] Configure database connection
- [ ] Implement authentication system
- [ ] Create database models and migrations
- [ ] Build API routes
- [ ] Implement audio upload and storage
- [ ] Set up RTMP streaming integration
- [ ] Add analytics tracking
- [ ] Implement background jobs
- [ ] Write API tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Set up monitoring and logging
- [ ] Configure production deployment

---

## Resources

- **Product Metadata:** `../info.js`
- **Frontend Client:** `../client/`
- **Landing Page:** `../landing/`
- **Custom Routes Bootstrap:** `../@custom/`
- **Documentation:** `../docs/`

---

**Note:** This directory is a placeholder created as part of product structure bootstrap. The main application backend implementation is pending team assignment and product specifications finalization.

For early development/prototype backend code, see `../@custom/` directory.

**Created:** 2026-03-07  
**Task:** #8753 - Adiology structure completion
