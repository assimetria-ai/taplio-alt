# Settings Page

## Overview
Comprehensive settings page for Planora with account management, workspace configuration, and notification preferences.

## Features

### Account Settings
- Profile information (name, email)
- Password change
- Profile picture upload (placeholder)
- Account deletion (danger zone)

### Workspace Settings
- Workspace name configuration
- Timezone selection
- Date format preferences (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
- Time format (12h/24h)
- Week start day (Sunday/Monday)

### Notification Settings
- Email notification toggle
- Granular controls for:
  - Task assignments
  - Task completions
  - Task comments
  - Project invites
  - Weekly digest
- Browser notifications toggle
- Mobile push notifications toggle

### Billing (Placeholder)
- Current plan display
- Upgrade options
- Payment method management
- Billing history

## API Endpoints

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/update` - Update user profile and password
- `GET /api/user/notifications` - Get notification settings
- `PUT /api/user/notifications` - Update notification settings
- `DELETE /api/user/account` - Delete account

### Workspace Management
- `GET /api/workspace/settings` - Get workspace settings
- `PUT /api/workspace/settings` - Update workspace settings
- `GET /api/workspace/members` - Get workspace members
- `POST /api/workspace/invite` - Invite new members

## Database Schema

### NotificationSettings
```prisma
model NotificationSettings {
  id                    String   @id @default(cuid())
  emailNotifications    Boolean  @default(true)
  taskAssigned          Boolean  @default(true)
  taskCompleted         Boolean  @default(true)
  taskComments          Boolean  @default(true)
  projectInvites        Boolean  @default(true)
  weeklyDigest          Boolean  @default(true)
  pushNotifications     Boolean  @default(false)
  browserNotifications  Boolean  @default(true)
  userId                String   @unique
  // ... relations
}
```

### WorkspaceSettings
```prisma
model WorkspaceSettings {
  id         String   @id @default(cuid())
  name       String   @default("My Workspace")
  timezone   String   @default("UTC")
  dateFormat String   @default("MM/DD/YYYY")
  timeFormat String   @default("12h")
  weekStart  String   @default("monday")
  userId     String
  // ... relations
}
```

## Setup

1. **Update database schema:**
   ```bash
   cd products/planora
   npx prisma migrate dev --name add_settings_tables
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

3. **Restart server:**
   The settings page will be accessible at `/dashboard/settings`

## Usage

Access the settings page via:
- Sidebar navigation "Settings" link
- Direct route: `/dashboard/settings`

The page uses tabs for organizing different settings categories, with auto-save on form submission.

## Security

- Password changes require current password verification
- Email changes trigger re-verification
- Account deletion requires password confirmation
- All endpoints require authentication via JWT token
