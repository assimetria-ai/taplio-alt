# Drop Scheduling - User Guide

**Feature:** Product Drop Scheduling  
**Status:** Live  
**Added:** 2026-03-08 (Task #9679)

---

## Overview

Drop Scheduling allows you to schedule product releases for specific dates and times. Perfect for:

- **Product launches** - Build anticipation for new releases
- **Limited editions** - Create urgency with time-limited drops
- **Exclusive access** - Control who can access your drops
- **Timed releases** - Coordinate releases across timezones

## Quick Start

### 1. Create a Drop

Navigate to your dashboard and click "Create Drop".

Fill in:
- **Name** - What people will see (e.g., "Summer Collection 2026")
- **Slug** - URL-friendly identifier (e.g., "summer-collection-2026")
- **Description** - Tell people what this drop is about
- **Scheduled Date** - When the drop goes live
- **End Date** (optional) - When the drop ends

### 2. Add Your Files

Upload or select files to include in the drop. You can add:
- Images, videos, documents
- Design files, templates
- Software, assets
- Any file type supported by DropMagic

### 3. Configure Access

Choose who can access your drop:

- **Public** - Anyone with the link
- **Authenticated** - Only logged-in users
- **Email List** - Specific email addresses only
- **Domain** - Anyone from a specific domain (e.g., @yourcompany.com)

### 4. Set Notifications (Optional)

Get notified when:
- Drop goes live
- Drop ends
- Before drop starts (reminder)

Add email addresses to notify subscribers.

### 5. Schedule It!

Once you're ready, click "Schedule Drop". The drop will:
- Appear in your dashboard as "Scheduled"
- Automatically go live at the scheduled time
- Send notifications (if configured)
- Track downloads and views

## Status Lifecycle

```
┌─────────┐
│  Draft  │ ← Initial state
└────┬────┘
     │ (Click "Schedule")
     ↓
┌──────────┐
│Scheduled │ ← Waiting for scheduled time
└────┬─────┘
     │ (Automatic at scheduled time)
     ↓
┌──────┐
│ Live │ ← Active and available
└───┬──┘
    │ (Automatic at end time, or manual cancel)
    ↓
┌────────┐
│ Ended  │ ← No longer available
└────────┘
```

You can cancel at any time from Scheduled or Live status.

## Access Control Examples

### Public Drop
Anyone with the link can access:
```
✓ Public: Yes
✓ Requires Auth: No
✓ Email List: (empty)
✓ Domain List: (empty)
```

### Team-Only Drop
Only your team members can access:
```
✓ Public: No
✓ Requires Auth: Yes
✓ Domain List: @yourcompany.com
```

### Exclusive Drop
Only specific people can access:
```
✓ Public: No
✓ Requires Auth: Yes
✓ Email List: 
  - vip1@example.com
  - vip2@example.com
  - vip3@example.com
```

### Limited Public Drop
Anyone can access, but only 100 downloads:
```
✓ Public: Yes
✓ Download Limit: 100
```

## Download Tracking

View real-time stats for your drops:
- Total downloads
- Remaining downloads (if limit set)
- View counts
- Geographic distribution
- Peak activity times

## Best Practices

### Scheduling

- **Schedule ahead** - Give yourself buffer time to prepare
- **Test first** - Create a private test drop to verify everything works
- **Time zones matter** - DropMagic uses UTC; convert your local time
- **Avoid midnight** - Schedule at reasonable hours for your audience

### Access Control

- **Start public, then restrict** - Easier to add restrictions than remove
- **Use domains for teams** - Simpler than managing individual emails
- **Test access** - Use a non-admin account to verify access rules work

### Notifications

- **Don't spam** - Be selective with notification emails
- **Segment your audience** - Different lists for different drop types
- **Test emails first** - Send test notifications before scheduling
- **Set reminders wisely** - 1 hour or 24 hours work well

### File Management

- **Upload in advance** - Don't wait until scheduled time
- **Check file sizes** - Large files may need longer download windows
- **Verify links** - Make sure download links work before scheduling
- **Prepare descriptions** - Include clear file descriptions

## Troubleshooting

### Drop didn't go live at scheduled time

- Check the status - It should show "Live" if the time has passed
- Verify the scheduled time was in the future when you scheduled it
- Check server time zone (UTC by default)
- Contact support if the scheduler appears stopped

### Can't access my own drop

- Make sure you're logged in
- Verify you're the owner (check the "My Drops" section)
- Private drops require access permissions even for owners in public view

### Download limit reached too quickly

- Review your audience size
- Consider increasing the limit
- Check if the drop was shared publicly when it shouldn't be
- Monitor download patterns for unusual activity

### Notifications not sending

- Verify email addresses are correct
- Check notification settings are enabled
- Look for bounce notifications
- Confirm email service is configured correctly

## API Access

For developers, the Drop Scheduling API provides:

```bash
# List all drops
GET /api/drops

# Get specific drop
GET /api/drops/:id
GET /api/drops/slug/:slug

# Create drop
POST /api/drops

# Update drop
PATCH /api/drops/:id

# Schedule drop
POST /api/drops/:id/schedule

# Cancel drop
POST /api/drops/:id/cancel

# Download files
POST /api/drops/:id/download
```

See full API documentation at [docs.dropmagic.io/api/drops](https://docs.dropmagic.io/api/drops)

## FAQ

**Q: Can I change the scheduled time after scheduling?**  
A: Yes, but only before the drop goes live. Once live, the schedule is locked.

**Q: Can I add more files after a drop is live?**  
A: No, files are locked once the drop goes live. You can create a new drop instead.

**Q: What happens if I reach the download limit?**  
A: New download requests will be rejected with a "limit reached" message.

**Q: Can I re-use a slug from an old drop?**  
A: Yes, but only after deleting the old drop. Slugs must be unique.

**Q: How do I extend a drop that's about to end?**  
A: Update the "End Date" field before it expires. You can set it to null for no end date.

**Q: Can I see who downloaded my files?**  
A: Download tracking shows counts and stats. Individual user tracking requires authentication.

---

**Need help?** Contact support@dropmagic.io or visit [docs.dropmagic.io](https://docs.dropmagic.io)
