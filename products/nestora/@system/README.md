# @system — Landing-Page Template

**Note**: Nestora is a **landing-page-only product template**.

## Template Type: Landing Page

This product is a minimal template focused on delivering a marketing landing page without backend infrastructure.

### Structure

```
nestora/
├── info.js              — Product metadata (central source of truth)
├── landing/             — Landing page implementation (React/HTML)
├── docs/                — Documentation (QA, setup guides)
├── @system/             — (This folder) — Template type marker
└── @custom/             — Product-specific customizations (optional)
```

### Template Purpose

**Landing-Page Templates** are designed for:
- Quick product launches
- Marketing campaigns
- Pre-launch waitlists
- Simple product showcases

### What's NOT Included

Landing-page templates **do not include**:
- Backend API or server code
- Database schemas
- Authentication systems
- Complex application logic

### Why @system?

The `@system` folder serves as a **template type marker** for QA validation and documentation purposes. In full-stack products, this folder contains shared backend code. For landing-page products like Nestora, it exists primarily to:

1. Meet template structure requirements (documented in `docs/QA.md`)
2. Clearly identify the template type (landing-only vs. full-stack)
3. Provide a place for template-level documentation

### What's Implemented

- ✅ Product metadata (`info.js`)
- ✅ Landing page implementation (`landing/`)
- ✅ QA documentation (`docs/QA.md`)
- ✅ Template type marker (`@system/README.md`)
- ⏳ Custom features (if needed, add to `@custom/`)

### Comparison: Landing vs. Full-Stack

| Feature | Landing Template | Full-Stack Template |
|---------|-----------------|---------------------|
| Landing page | ✅ Yes | ✅ Yes |
| Backend API | ❌ No | ✅ Yes |
| Database | ❌ No | ✅ Yes |
| Authentication | ❌ No | ✅ Yes |
| @system folder | 📄 Marker only | 📁 Shared code |
| @custom folder | 🎨 UI overrides | 🔧 Business logic |

### Development Path

If Nestora evolves from landing-only to full-stack:

1. **@system/** would contain:
   - Authentication system (`@system/auth/`)
   - Database schemas (`@system/db/`)
   - API utilities (`@system/api/`)
   - Shared middleware (`@system/middleware/`)

2. **@custom/** would contain:
   - Property management logic
   - Tenant portal features
   - Payment processing
   - Nestora-specific business rules

### Current State

**Template Type**: Landing Page Only  
**@system Purpose**: Template marker + documentation  
**Backend Status**: Not applicable (landing-only)  
**Upgrade Path**: Can migrate to full-stack when backend needed

---

**Template Type**: Landing Page  
**Created**: 2026-03-07  
**Maintained By**: Duarte QA System

---

## QA Compliance Note

This folder exists to satisfy template structure requirements documented in `docs/QA.md`. All product templates require an `@system/` directory with a README explaining the template type.

**References:**
- Template structure: `docs/QA.md` → "Template Structure Validation"
- QA compliance: `docs/QA.md` → "Template Compliance"
