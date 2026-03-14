# Taplio Alt

AI-powered LinkedIn content creation and scheduling tool. Write better posts, schedule smarter, and grow your audience.

**Schedule smarter, grow your audience.**

## Overview

Taplio Alt is an AI-native LinkedIn tool designed for creators, marketers, and professionals who want to build their LinkedIn presence. It combines AI-powered post writing with intelligent scheduling, analytics, and lead generation — all at a fraction of the cost of existing tools.

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| Authentication | Email/password registration, login, forgot password, LinkedIn OAuth, JWT sessions, profile settings | Planned |
| AI Post Writer | Generate LinkedIn posts with AI — choose topic, tone, length, format. Hashtag suggestions, rewrites, and variations | Planned |
| Post Scheduler | Schedule posts with date/time picker, optimal time suggestions, queue management, timezone support, bulk scheduling | Planned |
| Content Calendar | Visual week/month calendar view, drag-and-drop rescheduling, color-coded status, gap detection | Planned |
| Content Templates | Pre-built LinkedIn post templates: listicles, hot takes, storytelling, how-to, carousel outlines, engagement hooks | Planned |
| Engagement Analytics | Post performance dashboard: impressions, likes, comments, shares, CTR. Follower growth, best posts, optimal times | Planned |
| Lead Generation | Track engagement, profile enrichment, filter leads, export CSV, basic CRM with notes and follow-up reminders | Planned |

## Tech Stack

- **Frontend**: React 18 + Webpack 5 + SCSS
- **Backend**: Node.js / Express + GraphQL (Apollo Server)
- **Database**: PostgreSQL
- **Queue**: BullMQ
- **Auth**: JWT + bcrypt + LinkedIn OAuth
- **Storage**: AWS S3
- **Email**: AWS SES
- **Monitoring**: Sentry
- **Deployment**: Railway (Docker)

## Project Structure

```
taplio-alt/
  client/           # React frontend (Webpack 5)
    src/
      App.jsx       # Root component
      app/          # Application modules
      config/       # Frontend configuration
      main.jsx      # Entry point
      test/         # Frontend tests
  server/           # Express + GraphQL backend
    src/
      api/          # REST API routes
      app.js        # Express app setup
      config/       # Server configuration
      db/           # Database migrations, seeds, models
      graphql/      # GraphQL schema and resolvers
      index.js      # Server entry point
      lib/          # Shared utilities
      routes/       # Route definitions
      scheduler/    # Job scheduling (BullMQ)
      workers/      # Background workers
  @system/          # Template sync files (do not modify)
  products/         # Multi-product monorepo services
  Dockerfile        # Production Docker build
  nixpacks.toml     # Nixpacks build configuration
  railway.toml      # Railway deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm 9+

### Installation

```bash
# Install client dependencies
cd client && npm ci

# Install server dependencies
cd ../server && npm ci
```

### Database Setup

```bash
cd server

# Run migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

### Development

```bash
# Start the backend (with hot reload)
cd server && npm run dev

# Start the frontend (separate terminal)
cd client && npm run dev
```

The frontend dev server runs on `http://localhost:8080` (default Webpack) and the backend on `http://localhost:3000`.

### Production Build

```bash
# Build frontend
cd client && npm run build

# Copy to server public directory
cp -r dist ../server/public

# Start production server
cd ../server && npm start
```

## Deployment

Deployed to **Railway** via Docker. The `Dockerfile` handles the full build pipeline.

- **Production URL**: https://taplio-web-production.up.railway.app
- **Health check**: `/health`

## Testing

```bash
# Frontend tests
cd client && npm test

# Backend tests
cd server && npm test
```

## License

Proprietary — Assimetria AI. All rights reserved.
