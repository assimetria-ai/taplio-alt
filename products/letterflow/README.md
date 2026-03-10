# LetterFlow

**Email newsletter platform with subscriber management and analytics**

## Features

- **Newsletter Creation**: Rich HTML editor with MJML template support
- **Subscriber Management**: Lists, tags, import/export
- **Campaign Scheduling**: Send now or schedule for later
- **Analytics**: Open rates, click tracking, engagement metrics
- **Email Delivery**: SMTP or third-party email service integration
- **Multi-User**: Team collaboration and permission management

## Database Schema

### Newsletters Table (Core)

The primary `newsletters` table stores email campaign data:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `title` | String | Newsletter title/name |
| `user_id` | String | Creator/owner of the newsletter |
| `html_content` | Text | Full HTML email content |
| `plain_content` | Text (nullable) | Plain text fallback |
| `subject` | String (nullable) | Email subject line |
| `status` | String | draft, scheduled, published |
| `published_at` | DateTime (nullable) | When newsletter was sent |
| `scheduled_for` | DateTime (nullable) | Scheduled send time |
| `subscriber_count` | Int | Total recipients (defaults to 0) |
| `open_rate` | Float | Percentage of opens (0-100) |
| `click_rate` | Float | Percentage of clicks (0-100) |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update |

**Indexes:**
- `user_id` - Fast user newsletter queries
- `status` - Filter by draft/published
- `published_at` - Time-series analysis

### Users Table

User accounts for newsletter management:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | User email |
| `name` | String (nullable) | Display name |
| `password` | String | Hashed password |
| `email_verified` | Boolean | Email verification status |
| `created_at` | DateTime | Account creation |
| `updated_at` | DateTime | Last update |

### Subscribers Table

Email recipients and subscriber data:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | Subscriber email |
| `name` | String (nullable) | Subscriber name |
| `status` | String | active, unsubscribed, bounced |
| `source` | String (nullable) | How they subscribed |
| `tags` | String[] | Subscriber tags |
| `metadata` | JSON | Custom fields |
| `subscribed_at` | DateTime | Subscription date |
| `unsubscribed_at` | DateTime (nullable) | Unsubscribe date |
| `created_at` | DateTime | Record creation |
| `updated_at` | DateTime | Last update |

**Indexes:**
- `email` (unique) - Fast subscriber lookup
- `status` - Filter active/unsubscribed

### Subscriber Lists Table

Organize subscribers into lists:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `user_id` | String | List owner |
| `name` | String | List name |
| `description` | String (nullable) | List description |
| `is_default` | Boolean | Default list flag |
| `count` | Int | Cached subscriber count |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update |

### Newsletter Deliveries Table

Track individual email sends:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `newsletter_id` | String | Foreign key to newsletter |
| `subscriber_id` | String | Foreign key to subscriber |
| `status` | String | pending, sent, delivered, opened, clicked, bounced, failed |
| `sent_at` | DateTime (nullable) | When email was sent |
| `delivered_at` | DateTime (nullable) | When email was delivered |
| `opened_at` | DateTime (nullable) | First open timestamp |
| `clicked_at` | DateTime (nullable) | First click timestamp |
| `bounced_at` | DateTime (nullable) | Bounce timestamp |
| `error_message` | String (nullable) | Failure reason |
| `created_at` | DateTime | Record creation |
| `updated_at` | DateTime | Last update |

**Indexes:**
- `newsletter_id` - Fast campaign analytics
- `subscriber_id` - Subscriber engagement history
- `status` - Filter by delivery status
- Unique constraint on `[newsletter_id, subscriber_id]`

### Newsletter Analytics Table

Detailed engagement tracking:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Primary key |
| `newsletter_id` | String | Foreign key to newsletter |
| `event` | String | open, click, unsubscribe, bounce |
| `subscriber_id` | String (nullable) | Who performed action |
| `ip_address` | String (nullable) | Visitor IP |
| `user_agent` | String (nullable) | Browser/device info |
| `link_url` | String (nullable) | Clicked link URL |
| `metadata` | JSON | Additional data |
| `created_at` | DateTime | Event timestamp |

**Indexes:**
- `newsletter_id` - Campaign analytics
- `event` - Filter by event type
- `created_at` - Time-series queries

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and SMTP credentials
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
- **Email**: Nodemailer (SMTP) or SendGrid/Mailgun
- **Templates**: MJML (responsive email templates)
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Authentication**: JWT + bcrypt
- **Charts**: Recharts

## API Endpoints (Planned)

### Newsletters
- `POST /api/newsletters` - Create newsletter
- `GET /api/newsletters` - List newsletters
- `GET /api/newsletters/:id` - Get newsletter details
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter
- `POST /api/newsletters/:id/send` - Send/schedule newsletter
- `GET /api/newsletters/:id/analytics` - Get campaign analytics

### Subscribers
- `POST /api/subscribers` - Add subscriber
- `GET /api/subscribers` - List subscribers
- `PUT /api/subscribers/:id` - Update subscriber
- `DELETE /api/subscribers/:id` - Delete subscriber
- `POST /api/subscribers/import` - Bulk import
- `POST /api/subscribers/:id/unsubscribe` - Unsubscribe

### Lists
- `POST /api/lists` - Create list
- `GET /api/lists` - List all lists
- `POST /api/lists/:id/subscribers` - Add subscriber to list
- `DELETE /api/lists/:id/subscribers/:subscriberId` - Remove from list

### Public Endpoints
- `GET /unsubscribe/:token` - Unsubscribe link
- `GET /track/:newsletterId/:subscriberId/open.png` - Open tracking pixel
- `GET /track/:newsletterId/:subscriberId/click` - Click tracking redirect

## License

PROPRIETARY
