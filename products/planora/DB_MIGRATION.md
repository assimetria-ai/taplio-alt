# Database Migration - Settings Tables

## Migration Required

This update adds two new tables to support user settings:
- `notification_settings` - User notification preferences
- `workspace_settings` - Workspace configuration

## Running the Migration

### Development

```bash
cd products/planora
npx prisma migrate dev --name add_settings_tables
```

This will:
1. Create the migration file
2. Apply it to your database
3. Regenerate the Prisma client

### Production

```bash
npx prisma migrate deploy
```

## Verification

After migrating, verify the tables exist:

```sql
-- Check tables
\dt notification_settings
\dt workspace_settings

-- Verify schema
\d notification_settings
\d workspace_settings
```

## Rollback

If you need to rollback:

```bash
# Reset to previous migration
npx prisma migrate reset

# Or manually drop tables
DROP TABLE IF EXISTS notification_settings;
DROP TABLE IF EXISTS workspace_settings;
```

## Notes

- Default values are set in the schema for all fields
- Settings are auto-created on first access for each user
- Deleting a user cascades and removes their settings
