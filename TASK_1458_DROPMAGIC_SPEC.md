# DropMagic Product Specification

**Product**: dropmagic  
**Status**: Not built (empty directory)  
**Task**: #1458 - Rebuild from product template

## Product Identity

- **Name**: DropMagic
- **Slug**: dropmagic
- **Tagline**: Launch your drop. Watch it land.
- **Description**: Launch your next product drop with countdown pages, email captures, and viral share mechanics.

## Purpose

DropMagic helps entrepreneurs and product teams launch new products with professional landing pages, email list building, and viral growth mechanics. Think Product Hunt + ConvertKit + ReferralCandy rolled into one.

## MVP Features (from Database)

### Critical Priority
1. **Launch Page Builder** (status: done*)
   - Drag-and-drop builder for creating product launch landing pages
   - *Note: Marked "done" in DB but product doesn't exist yet

2. **Email Capture & Waitlist** (status: done*)
   - Collect emails from interested users before launch
   - Core functionality for building anticipation

### High Priority
3. **Launch Analytics Dashboard** (status: done*)
   - Track signups, conversions, traffic sources, and engagement metrics
   - Real-time metrics for launch optimization

4. **Viral Share Mechanics** (status: planned)
   - Referral loops and social share incentives
   - Grow the waitlist organically through user sharing
   - *Only feature marked as "planned"

5. **Launch Countdown Timer** (status: done*)
   - Display countdown to launch date
   - Timezone support for global launches

### Medium Priority
6. **Social Sharing Tools** (status: done*)
   - Pre-built social share buttons
   - Custom OG images for social media

7. **Email Campaign Integration** (status: done*)
   - Send announcement emails to waitlist
   - Launch day notifications

### Low Priority
8. **Product Hunt Integration** (status: done*)
   - Auto-post launch announcement to Product Hunt
   - Streamline PH launch process

*Note: Database shows "done" status for most features, but this appears to be planned/designed status rather than actual implementation since the product directory is empty.

## Implementation Plan

### Phase 1: Scaffold from Template
1. Copy product-template to dropmagic directory
2. Configure package.json with dropmagic details
3. Set up branding (colors, fonts, logo)
4. Initialize git repository
5. Create initial commit

### Phase 2: Core Features (@custom)
Build these in `@custom/` directories:

**Database Schema** (`server/src/db/schemas/@custom/`):
- `launches.sql` - Launch campaigns table
- `email_captures.sql` - Waitlist emails
- `shares.sql` - Referral tracking
- `analytics.sql` - Event tracking

**API Endpoints** (`server/src/api/@custom/`):
- `/api/launches` - CRUD for launch pages
- `/api/waitlist` - Email capture endpoint
- `/api/analytics` - Stats and metrics
- `/api/shares` - Referral tracking

**Frontend Pages** (`client/src/app/pages/@custom/`):
- `LaunchBuilderPage.jsx` - Page builder interface
- `LaunchDashboardPage.jsx` - Analytics overview
- `LaunchPreviewPage.jsx` - Live preview of launch page
- `WaitlistPage.jsx` - Manage email captures

**Public Landing** (`client/src/app/pages/static/@custom/`):
- `LaunchPage.jsx` - Public-facing launch page
- `CountdownPage.jsx` - Countdown timer view

### Phase 3: Launch Page Builder
This is the core feature - users create custom launch pages:
- Drag-and-drop interface (use react-dnd or similar)
- Pre-built blocks (hero, countdown, email form, social share, etc.)
- Live preview
- Save/publish functionality

### Phase 4: Analytics & Viral Mechanics
- Real-time signup tracking
- Traffic source attribution  - Referral link generation
- Social share incentives (unlock rewards for sharing)

## Tech Stack

Must match product template:
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + PostgreSQL (pg-promise)
- **Auth**: JWT sessions
- **File Storage**: Local or S3 (for images/assets)
- **Deployment**: Railway via Dockerfile

## Estimated Effort

- **Phase 1** (Scaffold): 30 minutes
- **Phase 2** (Core features): 4-6 hours
- **Phase 3** (Page builder): 8-12 hours
- **Phase 4** (Analytics/viral): 4-6 hours

**Total**: 16-24 hours for full MVP

## Quick Start (Minimal Viable Product)

To complete task #1458 quickly, focus on:
1. ✅ Scaffold from template (30 min)
2. ✅ Basic database schema (1 hour)
3. ✅ Email capture endpoint (1 hour)
4. ✅ Simple launch page template (2 hours)
5. ✅ Basic dashboard (2 hours)

**Total Quick MVP**: 6-7 hours

Advanced features (drag-and-drop builder, viral mechanics) can be added later.

## Related Products

For reference/inspiration:
- **WaitlistKit**: Similar email capture functionality
- **Brix**: Has page builder features
- **Broadr**: Has scheduling and publishing features

## Next Steps

1. **Confirm MVP scope**: Does task #1458 require full features or just scaffold?
2. **Get branding assets**: Colors, logo, fonts for dropmagic
3. **Scaffold from template**: Copy structure and configure
4. **Implement core features**: Email capture + basic dashboard
5. **Deploy to Railway**: Test production build
6. **Mark task #1458 complete**: Update database

## Questions to Resolve

- Should dropmagic be fully featured or just scaffolded?
- Are the "done" features in DB aspirational or do they need implementation?
- What's the priority timeline for task #1458 completion?
- Is there existing design/branding for dropmagic?

---

**Prepared by**: anton (junior agent)  
**Date**: 2026-03-04  
**Source**: PostgreSQL database `assimetria_os.products` and `assimetria_os.product_features`
