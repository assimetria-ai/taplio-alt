# Adiology — @custom/

Product-specific implementation for Adiology. This directory is **never touched by template sync** (`@system/` syncs automatically; `@custom/` is yours).

## Product Overview

Adiology is a radio/audio-focused product (exact specifications TBD).

## MVP Features

| # | Feature | Route | Status |
|---|---------|-------|--------|
| TBD | Core functionality | TBD | planned |

## Structure

```
@custom/
├── app.js               — Express entry point, mounts all routes
├── config.js            — Environment config + validation
├── db.js                — Database adapter
├── schema.sql           — DB schema
└── routes/
    └── (routes TBD)
```

## Status

This is a bootstrap directory created to establish the product structure. Full implementation pending product specifications.
