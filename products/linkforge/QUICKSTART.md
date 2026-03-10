# LinkForge Quickstart

Get LinkForge running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git

## Installation

```bash
# 1. Navigate to LinkForge directory
cd products/linkforge

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/linkforge
```

## Database Setup

```bash
# 1. Create database
createdb linkforge

# 2. Run migrations
npm run db:migrate

# 3. Generate Prisma client
npm run db:generate

# 4. (Optional) Seed with test data
npm run db:seed
```

## Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000`

## Test the Redirect Handler

### 1. Create a Test Link (Manually in DB)

```sql
INSERT INTO links (id, slug, target_url, clicks, created_at, updated_at)
VALUES (
  'test123',
  'google',
  'https://www.google.com',
  0,
  NOW(),
  NOW()
);
```

Or use Prisma Studio:

```bash
npm run db:studio
# Opens GUI at http://localhost:5555
```

### 2. Test Redirect

Open in browser:
```
http://localhost:3000/google
```

You should be redirected to Google!

### 3. Check Analytics

```bash
# View click events
npm run db:studio
# Go to ClickEvent table
```

Or query directly:

```sql
SELECT * FROM click_events ORDER BY created_at DESC LIMIT 10;
```

## Track a Conversion

Add this to your landing page:

```html
<script>
  // Track when user completes purchase
  fetch('http://localhost:3000/api/conversions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      linkId: 'test123',
      conversionType: 'purchase',
      value: 29.99,
      extra: { productId: 'widget-001' }
    })
  });
</script>
```

## View Conversions

```bash
curl http://localhost:3000/api/conversions/test123
```

## Run Tests

```bash
npm test
```

## Common Issues

### "Database does not exist"
```bash
createdb linkforge
```

### "Port 3000 already in use"
Change PORT in `.env`:
```
PORT=3001
```

### "Prisma Client not generated"
```bash
npm run db:generate
```

## Next Steps

- Create link management API endpoints
- Build React frontend
- Add user authentication
- Deploy to Railway/Vercel
- Set up custom domain

## Documentation

- Full implementation details: [IMPLEMENTATION.md](IMPLEMENTATION.md)
- Database schema: [README.md](README.md#database-schema)
- API reference: [README.md](README.md#api-endpoints)

## Support

Questions? Check the docs or open an issue.

Happy link shortening! 🔗✨
