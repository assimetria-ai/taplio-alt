# @system — System Template (Product in Development)

**Note**: Adiology is currently in **early development stage**.

## Template Type: Product in Development

This product has a basic @custom structure established but is awaiting full implementation specifications.

### Structure

```
adiology/
├── info.js              — Product metadata (central source of truth)
├── landing/             — Landing page assets (to be created)
├── docs/                — Documentation (QA, setup guides)
├── @system/             — (This folder) — System placeholder
└── @custom/             — Product-specific implementation
    ├── app.js           — Express entry point
    ├── config.js        — Environment configuration
    └── README.md        — Product-specific documentation
```

### Development Status

**Current Phase:** Bootstrap  
**Backend Status:** Structure created, implementation pending  
**Landing Page:** Not yet created  
**Product Focus:** Radio streaming and podcast platform

### What's Implemented

- ✅ Basic @custom structure (app.js, config.js)
- ✅ Product metadata (info.js)
- ✅ System directory placeholder (@system/)
- ⏳ Landing page (pending)
- ⏳ Documentation (pending)
- ⏳ Backend routes (pending)

### Why @system?

The `@system` folder in full-stack product templates contains shared backend code (authentication, database, API utilities) that syncs automatically across products. For Adiology, this will be populated once:

1. Core backend architecture is defined
2. Shared authentication system is implemented
3. Database schema is finalized

#### Full-Stack Templates (Future State)
- `@system/` will contain shared backend code (auth, DB, API)
- `@custom/` contains Adiology-specific features (streaming, podcasts)

#### Current State
- `@system/` is a placeholder awaiting implementation
- `@custom/` has basic structure ready for development
- `landing/` needs to be created
- Product specifications are being defined

---

**Template Type**: Product in Development  
**Created**: 2026-03-07  
**Maintained By**: Duarte QA System
