# Adiology API

Professional radio streaming and podcast platform API.

## Features (Planned)

- Live radio broadcasting
- Podcast hosting and distribution
- Analytics and listener insights
- User authentication and management
- Stream management

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Info
- `GET /api/info` - API information

### Streams (To Be Implemented)
- `GET /api/streams` - List all streams
- `POST /api/streams` - Create new stream
- `GET /api/streams/:id` - Get stream details
- `PUT /api/streams/:id` - Update stream
- `DELETE /api/streams/:id` - Delete stream

### Podcasts (To Be Implemented)
- `GET /api/podcasts` - List all podcasts
- `POST /api/podcasts` - Create new podcast
- `GET /api/podcasts/:id` - Get podcast details

### Analytics (To Be Implemented)
- `GET /api/analytics` - Get analytics data

## Environment Variables

See `.env.example` for required environment variables.

## Tech Stack

- Node.js
- Express.js
- (Database to be configured)
- (Authentication to be configured)
- (Streaming server to be configured)

## Development Status

⚠️ **Initial Setup** - API structure created, core features to be implemented.
