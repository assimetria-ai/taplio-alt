# Nestora — Product Template QA Documentation

**Product:** Nestora  
**Type:** Product Template  
**Status:** Active Template  
**Last Updated:** 2026-03-06

---

## Table of Contents

1. [QA Overview](#qa-overview)
2. [Template Structure Validation](#template-structure-validation)
3. [Metadata Validation](#metadata-validation)
4. [Landing Page QA](#landing-page-qa)
5. [Manual Testing Checklist](#manual-testing-checklist)
6. [Known Issues](#known-issues)
7. [Template Compliance](#template-compliance)

---

## QA Overview

Nestora is a **product template** for a smart property management and real estate platform. As a template, the QA focus is on:

- **Template structure integrity** (required files present, correct naming)
- **Metadata completeness** (info.js configuration)
- **Landing page functionality** (renders correctly, no broken links)
- **Template reusability** (can be cloned/deployed without modification)

### QA Principles for Templates

1. **Metadata-First:** All product information centralized in `info.js`
2. **Zero Hardcoding:** No hardcoded values that would break when cloned
3. **Self-Documenting:** Template structure clear and obvious
4. **Production-Ready:** Can deploy with minimal configuration

---

## Template Structure Validation

### Required Files & Folders

```
nestora/
├── info.js              ✅ Required — Product metadata
├── landing/             ✅ Required — Landing page assets
│   └── (page files)
└── docs/                ✅ Required — Documentation
    └── QA.md            ✅ Required — This file
```

### Optional Files

```
nestora/
├── README.md            ⏳ Recommended — Product overview
├── @custom/             ⏳ Optional — Custom overrides
└── assets/              ⏳ Optional — Images, icons, etc.
```

### Validation Checks

- [ ] `info.js` exists and is valid JavaScript
- [ ] `landing/` directory exists
- [ ] `docs/` directory exists with QA.md
- [ ] No absolute paths or hardcoded domains (except official product URLs)
- [ ] No placeholder text like "REPLACE_WITH_..." remains in production

---

## Metadata Validation

### info.js Schema Compliance

The `info.js` file must export a `PRODUCT_INFO` object with the following required fields:

#### Core Metadata (Required)
- ✅ `name` — Product display name (string)
- ✅ `slug` — URL-safe product identifier (string)
- ✅ `description` — Short product description (string)
- ✅ `tagline` — Marketing tagline (string)

#### URLs & Contact (Required)
- ✅ `url` — Official product website (string)
- ✅ `email` — General contact email (string)
- ✅ `supportEmail` — Support contact email (string)

#### Visual Identity (Required)
- ✅ `theme_color` — Primary brand color (hex string)
- ✅ `background_color` — Background color (hex string)

#### CTA Configuration (Required)
- ✅ `cta.title` — Call-to-action headline (string)
- ✅ `cta.description` — CTA supporting text (string)
- ✅ `cta.buttonText` — CTA button label (string)

#### Pricing & Plans (Required)
- ✅ `pricing` — Object with `monthly` and/or `yearly` pricing
- ✅ `plans` — Array of plan objects with features

#### Optional Fields
- ⏳ `socials` — Social media links (object)
- ⏳ `links` — Additional product links (object)
- ⏳ `features` — Feature list for landing page (array)
- ⏳ `authMode` — Authentication type: 'web2' or 'web3' (string)

### Current Nestora Metadata Status

**Last Validation:** 2026-03-06

| Field | Status | Value/Notes |
|-------|--------|-------------|
| name | ✅ Valid | "Nestora" |
| slug | ✅ Valid | "nestora" |
| description | ✅ Valid | "Smart property management..." |
| tagline | ✅ Valid | "Manage properties, tenants..." |
| url | ✅ Valid | https://nestora.app |
| email | ✅ Valid | hello@nestora.app |
| supportEmail | ✅ Valid | support@nestora.app |
| theme_color | ✅ Valid | #0ea5e9 (sky blue) |
| background_color | ✅ Valid | #f0f9ff (light sky) |
| pricing | ✅ Valid | $49/mo, $499/yr |
| plans | ⚠️ Warning | Stripe price ID placeholder |
| authMode | ✅ Valid | "web2" |
| features | ✅ Valid | 3 features defined |

**Action Items:**
- ⚠️ Replace `price_REPLACE_WITH_STRIPE_PRICE_ID` with actual Stripe price ID before production deployment

---

## Landing Page QA

### Landing Page Structure

The `landing/` directory should contain:

- HTML template or React component for landing page
- Styling (CSS/Tailwind/styled-components)
- Assets (images, icons) or references to shared assets

### Manual Landing Page Checks

#### Visual Rendering
- [ ] Landing page renders without errors
- [ ] Theme colors from `info.js` applied correctly
- [ ] Typography readable and consistent
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Images load correctly (no broken images)
- [ ] Icons display correctly

#### Content Accuracy
- [ ] Product name displays correctly
- [ ] Tagline matches `info.js`
- [ ] Description matches `info.js`
- [ ] CTA button text matches `info.js`
- [ ] Pricing information matches `info.js`
- [ ] Features list matches `info.js`

#### Functionality
- [ ] CTA button clickable (links to correct URL)
- [ ] Navigation links work (if present)
- [ ] Form validation works (if forms present)
- [ ] External links open in new tab
- [ ] No console errors in browser DevTools

#### SEO & Meta Tags
- [ ] Page title includes product name
- [ ] Meta description present
- [ ] Open Graph tags configured (for social sharing)
- [ ] Favicon/app icons present

---

## Manual Testing Checklist

### Pre-Deployment Template QA (5 minutes)

Run this checklist before deploying or sharing the template:

#### 1. File Structure
- [ ] All required files present (`info.js`, `landing/`, `docs/QA.md`)
- [ ] No temporary or test files (`.DS_Store`, `test.js`, etc.)
- [ ] No sensitive data (API keys, credentials)

#### 2. Metadata Validation
- [ ] `info.js` exports valid object
- [ ] All required fields populated
- [ ] No placeholder text like "REPLACE_WITH_..."
- [ ] URLs are absolute and valid (https://)
- [ ] Email addresses valid format

#### 3. Landing Page
- [ ] Landing page loads without errors
- [ ] All info.js data displays correctly
- [ ] Colors/theme consistent with brand
- [ ] Mobile responsive

#### 4. Documentation
- [ ] QA.md exists and is up-to-date
- [ ] README.md present (if applicable)
- [ ] No broken internal links in docs

#### 5. Template Reusability
- [ ] Can clone template without modification
- [ ] No hardcoded project-specific values (except official URLs)
- [ ] Clear what needs configuration vs. what's ready-to-use

---

## Known Issues

### Template Issues

1. **Stripe Price ID Placeholder**  
   **Status:** Expected (pre-production)  
   **Impact:** Payment integration won't work until replaced  
   **Action Required:** Replace `price_REPLACE_WITH_STRIPE_PRICE_ID` with actual Stripe price ID before deploying to production  
   **Location:** `info.js` → `plans[0].priceId`

2. **No README.md**  
   **Status:** Missing (optional)  
   **Impact:** Harder for new users to understand template  
   **Action Required:** Create README.md with product overview and setup instructions  
   **Priority:** Medium

### Non-Issues (Expected Behavior)

1. **Minimal Template Structure**  
   Product templates are intentionally minimal — they expand during actual product development.

2. **External Dependencies**  
   Template assumes external systems (Stripe, authentication, etc.) will be configured during deployment.

---

## Template Compliance

### Duarte QA System Compliance

**Status:** ✅ **COMPLIANT**

This product template now meets all Duarte automated QA requirements:

- ✅ `info.js` present and valid
- ✅ `landing/` directory exists
- ✅ `docs/QA.md` present (this file)
- ✅ Required metadata fields populated
- ✅ No critical placeholders remaining (only Stripe ID, which is expected)

### Template Version

**Version:** 1.0  
**Created:** 2026-03-06  
**Last QA Review:** 2026-03-06  
**Next Review:** When template structure or requirements change

---

## QA Contacts

### Template Responsibility

**Template Owner:** Anton (product templates)  
**QA System:** Duarte (automated product health checks)  
**Issues:** Report via task system or GitHub issues

### Reporting Template Issues

When reporting template issues:

1. Specify which template (product slug: `nestora`)
2. Describe what's missing or broken
3. Provide expected vs. actual behavior
4. Tag as "template" priority (vs. product priority)

---

## Appendix: Duarte QA Integration

This QA documentation was created in response to **Duarte task #8935**, which detected:

**Issue:** Missing QA documentation for Nestora product template  
**Detection:** Automated scan found `nestora/` folder without `docs/QA.md`  
**Resolution:** Created comprehensive QA documentation following template standards

### Future Automated Checks

Duarte's QA system will verify:

- ✅ `docs/QA.md` exists at expected path
- ✅ `info.js` schema compliance (required fields present)
- ✅ Landing page directory exists
- ✅ No critical placeholders (except Stripe ID)
- ✅ Documentation up-to-date (last updated < 6 months)

**Compliance Status:** ✅ Nestora product template is now QA-compliant

---

**Document Status:** Active  
**Last Updated:** 2026-03-06  
**Maintained By:** Duarte QA System + Anton (template owner)
