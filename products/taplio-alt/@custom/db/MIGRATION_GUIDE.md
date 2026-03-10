# Database Migration Guide
**Task #10273 - LinkedIn OAuth Connection Flow**

## Overview

This guide explains how to set up and migrate the database for the LinkedIn OAuth integration with encrypted token storage.

## Prerequisites

- PostgreSQL installed and running
- Node.js and npm installed
- Prisma CLI installed (`npm install -D prisma`)

## Initial Setup

### 1. Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Configure Database Connection

Update your `.env` file with the PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taplioalt?schema=public"
```

**Production example:**
```env
DATABASE_URL="postgresql://user:password@db.example.com:5432/production?schema=public&sslmode=require"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma client in `node_modules/@prisma/client` based on your schema.

## Running Migrations

### Development (with Prisma Migrate)

```bash
# Create and apply migration
npx prisma migrate dev --name add_oauth_encryption

# This will:
# 1. Create a new migration file in prisma/migrations/
# 2. Apply the migration to your database
# 3. Generate the Prisma client
```

### Production

```bash
# Apply pending migrations (no interactive prompts)
npx prisma migrate deploy
```

**Important:** Always test migrations in a staging environment first!

## Schema Changes (Task #10273)

The following fields were added to support encrypted token storage:

### OAuthToken Model Changes

**New fields:**
- `accessTokenIv` - Initialization vector for access token encryption
- `accessTokenTag` - Authentication tag for access token
- `refreshTokenIv` - Initialization vector for refresh token encryption
- `refreshTokenTag` - Authentication tag for refresh token

**Modified fields:**
- `accessToken` - Changed to `@db.Text` (was `String`)
- `refreshToken` - Changed to `@db.Text` (was `String?`)

## Manual Migration (if needed)

If you can't use Prisma Migrate, here's the SQL migration:

```sql
-- Add encryption fields to oauth_tokens table
ALTER TABLE oauth_tokens 
  ADD COLUMN access_token_iv VARCHAR(32),
  ADD COLUMN access_token_tag VARCHAR(32),
  ADD COLUMN refresh_token_iv VARCHAR(32),
  ADD COLUMN refresh_token_tag VARCHAR(32);

-- Change token columns to TEXT for larger encrypted values
ALTER TABLE oauth_tokens 
  ALTER COLUMN access_token TYPE TEXT,
  ALTER COLUMN refresh_token TYPE TEXT;

-- Add comment
COMMENT ON TABLE oauth_tokens IS 'OAuth tokens with AES-256-GCM encryption support (Task #10273)';
```

## Verifying Migration

### Check Schema

```bash
# Open Prisma Studio to view data
npx prisma studio
```

### Verify in Database

```sql
-- Check table structure
\d oauth_tokens

-- Check existing records
SELECT id, user_id, provider, 
       CASE WHEN access_token_iv IS NOT NULL THEN 'encrypted' ELSE 'plain' END as encryption_status
FROM oauth_tokens;
```

## Data Migration (Existing Tokens)

If you have existing plain-text tokens that need to be encrypted:

### Option 1: Force Re-authentication

**Recommended for security**

```sql
-- Delete all existing tokens (users will need to reconnect)
DELETE FROM oauth_tokens WHERE access_token_iv IS NULL;
```

Users will see "LinkedIn not connected" and can reconnect through the OAuth flow.

### Option 2: Encrypt Existing Tokens

**Use with caution - requires downtime**

```javascript
// scripts/encrypt-existing-tokens.js
const prisma = require('../@custom/db/client');
const { encryptToken } = require('../@custom/api/token-manager');

async function encryptExistingTokens() {
  const tokens = await prisma.oAuthToken.findMany({
    where: {
      accessTokenIv: null  // Find unencrypted tokens
    }
  });

  console.log(`Found ${tokens.length} unencrypted tokens`);

  for (const token of tokens) {
    try {
      // Encrypt access token
      const encryptedAccess = encryptToken(token.accessToken);
      
      // Encrypt refresh token if exists
      const encryptedRefresh = token.refreshToken 
        ? encryptToken(token.refreshToken)
        : null;

      // Update with encrypted values
      await prisma.oAuthToken.update({
        where: { id: token.id },
        data: {
          accessToken: encryptedAccess.encrypted,
          accessTokenIv: encryptedAccess.iv,
          accessTokenTag: encryptedAccess.authTag,
          refreshToken: encryptedRefresh?.encrypted,
          refreshTokenIv: encryptedRefresh?.iv,
          refreshTokenTag: encryptedRefresh?.authTag
        }
      });

      console.log(`✓ Encrypted token for user ${token.userId}`);
    } catch (error) {
      console.error(`✗ Failed to encrypt token ${token.id}:`, error);
    }
  }

  console.log('Encryption complete');
}

// Run: node scripts/encrypt-existing-tokens.js
encryptExistingTokens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Rollback

If you need to rollback the migration:

```bash
# Prisma Migrate doesn't support rollback
# You'll need to manually revert

# 1. Delete the migration file
rm -rf prisma/migrations/[timestamp]_add_oauth_encryption

# 2. Restore previous schema
git checkout HEAD~1 -- @custom/db/schema.prisma

# 3. Reset database (WARNING: destroys data)
npx prisma migrate reset

# Or manually drop columns:
```

```sql
ALTER TABLE oauth_tokens 
  DROP COLUMN access_token_iv,
  DROP COLUMN access_token_tag,
  DROP COLUMN refresh_token_iv,
  DROP COLUMN refresh_token_tag;
```

## Production Deployment Checklist

### Before Deployment

- [ ] Test migration in staging environment
- [ ] Backup production database
- [ ] Set `TOKEN_ENCRYPTION_KEY` in production environment
- [ ] Document rollback plan
- [ ] Notify users of potential reconnection need

### During Deployment

```bash
# 1. Backup database
pg_dump -h hostname -U username dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migration
npx prisma migrate deploy

# 3. Verify migration
npx prisma db pull  # Should match schema.prisma

# 4. Test OAuth flow
# - Initiate new connection
# - Verify token storage
# - Test token refresh

# 5. Monitor logs for errors
```

### After Deployment

- [ ] Verify OAuth flow works
- [ ] Check token encryption in database
- [ ] Monitor error logs
- [ ] Test API calls with tokens
- [ ] Verify token refresh works

## Troubleshooting

### Migration Fails

**Error:** `relation "oauth_tokens" does not exist`

**Solution:** Run initial migration first:
```bash
npx prisma migrate dev --name init
```

---

**Error:** `column "access_token_iv" already exists`

**Solution:** Migration already applied, check with:
```bash
npx prisma migrate status
```

---

### Connection Issues

**Error:** `Can't reach database server`

**Solution:** Check DATABASE_URL and ensure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

---

### Schema Drift

**Error:** `Schema is out of sync with the database`

**Solution:** 
```bash
# Check what's different
npx prisma migrate diff \
  --from-schema-datamodel @custom/db/schema.prisma \
  --to-schema-datasource @custom/db/schema.prisma \
  --script

# Reset to schema (WARNING: destroys data)
npx prisma db push --accept-data-loss
```

## Useful Commands

```bash
# View migration status
npx prisma migrate status

# Generate SQL for migration (without applying)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel @custom/db/schema.prisma \
  --script > migration.sql

# Reset database (development only!)
npx prisma migrate reset

# Open database GUI
npx prisma studio

# Introspect existing database
npx prisma db pull

# Validate schema
npx prisma validate
```

## Support

If you encounter issues:

1. Check Prisma logs in `prisma/migrations/migration_lock.toml`
2. Review database logs
3. Consult [Prisma documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
4. Check PostgreSQL version compatibility

---

**Last Updated:** Task #10273  
**Schema Version:** v2 (with encryption support)
