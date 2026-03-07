# Aide — Product QA Documentation

**Product:** Aide  
**Type:** AI-Powered Development Assistant Platform  
**Status:** Bootstrap / Initial Setup  
**Last Updated:** 2026-03-07

---

## QA Overview

Aide is an **AI-powered development assistant platform** currently in bootstrap/initial setup phase. The QA focus is on:

- **Template structure establishment** (required directories and files)
- **Metadata completeness** (info.js configuration)
- **Development readiness** (structure ready for implementation)
- **Documentation accuracy** (clear status and next steps)

### QA Principles

1. **Structure First:** Establish proper directory structure before implementation
2. **Metadata-Driven:** All product information centralized in `info.js`
3. **Documentation:** Clear status of what's done and what's pending
4. **Development-Ready:** Structure ready for team to begin implementation

---

## Product Status

### Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| info.js | ✅ Complete | Product metadata defined |
| @system/ | ✅ Created | System directory with README |
| @custom/ | ✅ Created | Custom backend structure |
| docs/ | ✅ Created | This QA documentation |
| landing/ | ⏳ Planned | Landing page to be implemented |
| client/ | ⏳ Planned | Main application frontend |
| server/ | ⏳ Planned | Main application backend |

### Product Vision

**Primary Focus:** AI-powered coding assistant for developers

**Core Features (Planned):**
- Smart code completion with AI
- Automated code review
- Documentation generation
- Bug detection and fixes
- Multi-language support

---

## Template Structure Validation

### Current Structure

```
aide/
├── info.js              ✅ Product metadata
├── @system/             ✅ System directory
│   └── README.md        ✅ Documentation
├── @custom/             ✅ Product-specific placeholder
│   └── README.md        ✅ Documentation
├── docs/                ✅ Documentation
│   └── QA.md            ✅ This file
├── landing/             ⏳ PLANNED - Landing page
├── client/              ⏳ PLANNED - Main app frontend
└── server/              ⏳ PLANNED - Main app backend
```

### Required Components

- [x] `info.js` — Product metadata
- [x] `@system/` — System directory with README
- [x] `@custom/` — Product-specific implementation placeholder
- [x] `docs/` — Documentation directory
- [x] `docs/QA.md` — QA documentation
- [ ] `landing/` — Landing page directory
- [ ] `client/` — Main application frontend
- [ ] `server/` — Main application backend

### Validation Checks

- [x] Product directory exists at `products/aide/`
- [x] info.js exists and exports PRODUCT_INFO
- [x] @system/ directory exists with README.md
- [x] @custom/ directory exists with README.md
- [x] docs/ directory exists with QA.md
- [ ] landing/ directory exists (to be created)
- [ ] client/ directory exists (to be created)
- [ ] server/ directory exists (to be created)
- [x] No hardcoded values (except official product URLs)
- [x] All placeholder values clearly marked

---

## Metadata Validation

### info.js Schema Compliance

#### Core Metadata (Required)
- ✅ `name` — "Aide"
- ✅ `slug` — "aide"
- ✅ `description` — Product description
- ✅ `tagline` — "AI-powered development assistant platform"

#### URLs & Contact (Required)
- ✅ `url` — https://aide.app
- ✅ `email` — hello@aide.app
- ✅ `supportEmail` — support@aide.app

#### Visual Identity (Required)
- ✅ `theme_color` — #3b82f6 (blue)
- ✅ `background_color` — #eff6ff (light blue)

#### CTA Configuration (Required)
- ✅ `cta.title` — "Start Coding Smarter Today"
- ✅ `cta.description` — Call-to-action text
- ✅ `cta.buttonText` — "Get Started Free"

#### Pricing & Plans (Required)
- ✅ `pricing.monthly` — $19/month
- ✅ `pricing.yearly` — $199/year
- ✅ `plans` — Developer plan defined

#### Optional Fields
- ✅ `socials` — Twitter, GitHub links
- ✅ `links` — FAQ, docs, referral links
- ✅ `features` — 3 core features defined
- ✅ `authMode` — web2 (email/password)

### Current Metadata Status

| Field | Status | Value/Notes |
|-------|--------|-------------|
| name | ✅ Valid | "Aide" |
| slug | ✅ Valid | "aide" |
| theme_color | ✅ Valid | #3b82f6 (blue) |
| pricing | ✅ Valid | $19/mo, $199/yr |
| plans | ⚠️ Warning | Stripe price ID placeholder |
| authMode | ✅ Valid | "web2" |
| features | ✅ Valid | Smart completion, Code review, Documentation |

**Action Items:**
- ⚠️ Replace `price_REPLACE_WITH_STRIPE_PRICE_ID` with actual Stripe price ID before production

---

## Known Issues

### Warnings

1. **Stripe Price ID Placeholder**  
   **Status:** Expected (pre-production)  
   **Impact:** Payment integration won't work until replaced  
   **Action Required:** Replace with actual Stripe price ID before deploying  
   **Location:** `info.js` → `plans[0].priceId`

2. **Missing Implementation**  
   **Status:** Bootstrap phase  
   **Impact:** Product structure exists but no implementation code  
   **Action Required:** Create landing/, client/, server/ directories with implementations  
   **Priority:** High  

---

## Development Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Create product directory structure
- [x] Define product metadata in info.js
- [x] Create @system and @custom directories
- [x] Write QA documentation

### Phase 2: Landing Page (Planned)
- [ ] Design landing page layout
- [ ] Implement landing page with info.js data
- [ ] Add responsive styling
- [ ] Build with React/Vite + Tailwind CSS

### Phase 3: Backend Development (Planned)
- [ ] Define API routes for AI services
- [ ] Implement authentication
- [ ] Set up database schema
- [ ] Create code completion endpoints
- [ ] Implement code review system

### Phase 4: Frontend Application (Planned)
- [ ] Design developer dashboard
- [ ] Build code editor integration
- [ ] Implement AI suggestion UI
- [ ] Add usage analytics

---

## Template Compliance

### Duarte QA System Compliance

**Status:** ✅ **COMPLIANT** (bootstrap phase)

This product structure meets Duarte QA requirements for bootstrap phase:

- ✅ Product directory exists at `products/aide/`
- ✅ `info.js` present and valid
- ✅ `@system/` directory exists with README
- ✅ `@custom/` directory exists with README
- ✅ `docs/QA.md` present (this file)
- ⏳ `landing/` directory (planned)
- ⏳ `client/` directory (planned)
- ⏳ `server/` directory (planned)

### Completion Status

**Structure:** 50% complete (core directories + docs, missing implementations)  
**Metadata:** 100% complete  
**Documentation:** 100% complete  
**Landing Page:** 0% complete (planned)  
**Main Application:** 0% complete (planned)  
**Backend:** 0% complete (planned)

---

## QA Contacts

### Product Responsibility

**Product Owner:** TBD  
**QA System:** Duarte (automated product health checks)  
**Development:** Awaiting team assignment  
**Issues:** Report via task system

---

## Appendix: Task #9363 Resolution

This QA documentation was created in response to **Duarte task #9363**, which detected:

**Issue:** Product broken: aide  
**Root Cause:** Product "aide" did not exist in products/ directory  
**Resolution:** Created minimal compliant structure for Aide product  
**Date:** 2026-03-07

### Created Files

1. `products/aide/info.js` - Complete product metadata
2. `products/aide/@system/README.md` - System directory documentation
3. `products/aide/@custom/README.md` - Custom backend placeholder
4. `products/aide/docs/QA.md` - This QA documentation

### Future Automated Checks

Duarte's QA system should verify:

- ✅ Product directory exists
- ✅ `info.js` present with valid schema
- ✅ `@system/` directory exists
- ✅ `@custom/` directory exists
- ✅ `docs/QA.md` exists
- ⏳ `landing/` directory exists (future)
- ⏳ `client/` directory exists (future)
- ⏳ `server/` directory exists (future)

**Compliance Status:** ✅ Aide now has complete bootstrap structure

---

**Document Status:** Active  
**Last Updated:** 2026-03-07  
**Maintained By:** Duarte QA System + Product Team  

**Task #9363 Fix:** Created minimal compliant Aide product structure to resolve broken product issue.
