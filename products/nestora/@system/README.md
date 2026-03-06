# @system — System Template (Landing Page Only)

**Note**: Nestora is a **landing page-only product template**.

## Template Type: Landing Page Only

This product does not have a backend server or custom application logic, so there is no @system folder with shared backend code.

### Structure

```
nestora/
├── info.js              — Product metadata (central source of truth)
├── landing/             — Landing page assets
├── docs/                — Documentation (QA, setup guides)
└── @system/             — (This folder) — Placeholder for template compliance
```

### Why No @system Code?

The `@system` folder in full-stack product templates contains shared backend code (authentication, database, API utilities) that syncs automatically across products. Since Nestora is a **landing page only** (no server, no database), there is no shared system code.

### Template Compliance

This folder exists to satisfy Duarte QA's template structure requirements. Products are expected to have an `@system/` directory, even if it's empty for landing-only templates.

#### Full-Stack Templates (e.g., DropMagic, Brix)
- `@system/` contains shared backend code (auth, DB, API)
- `@custom/` contains product-specific features

#### Landing Page Templates (e.g., Nestora, Broadr, WaitlistKit)
- `@system/` is empty or contains only this README
- `landing/` contains the marketing site
- No backend → no need for @system/@custom separation

---

**Template Type**: Landing Page Only  
**Last Updated**: 2026-03-06  
**Maintained By**: Duarte QA System
