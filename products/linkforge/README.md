# LinkForge

**URL shortener with analytics and link management**

## Features

- **Short Links**: Generate custom or random short slugs
- **Analytics**: Track clicks, locations, referrers, and user agents
- **User Management**: Multi-user support with authentication
- **Click Tracking**: Detailed analytics per link

## Database Schema

### Links Table

The core `links` table stores short URL mappings:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `slug` | String (unique) | Short URL identifier (e.g., "abc123") |
| `target_url` | String | Full destination URL |
| `user_id` | String (nullable) | Owner of the link |
| `clicks` | Int | Total click count (defaults to 0) |
| `created_at` | DateTime | Timestamp of creation |
| `updated_at` | DateTime | Last update timestamp |

**Indexes:**
- `slug` (unique) - Fast lookup for redirects
- `user_id` - Efficient user link queries

### Users Table

User accounts for link management:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | User email |
| `name` | String (nullable) | Display name |
| `password` | String | Hashed password |
| `created_at` | DateTime | Account creation |
| `updated_at` | DateTime | Last update |

### Click Events Table

Detailed analytics for each click:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `link_id` | String | Foreign key to links |
| `user_agent` | String (nullable) | Browser/device info |
| `referer` | String (nullable) | Source URL |
| `ip_address` | String (nullable) | Visitor IP |
| `country` | String (nullable) | Geolocation country |
| `city` | String (nullable) | Geolocation city |
| `created_at` | DateTime | Click timestamp |

**Indexes:**
- `link_id` - Fast link analytics queries
- `created_at` - Time-series queries

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Authentication**: JWT + bcrypt

## API Endpoints (Planned)

- `POST /api/links` - Create short link
- `GET /api/links` - List user's links
- `GET /api/links/:id` - Get link details
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/links/:id/analytics` - Get link analytics
- `GET /:slug` - Redirect to target URL (and track click)

## License

PROPRIETARY
