# Nestora — @custom/

Product-specific implementation for Nestora. This directory is **never touched by template sync** (`@system/` syncs automatically; `@custom/` is yours).

## Product Overview

Nestora is a smart property management and real estate platform designed for property managers, landlords, and real estate professionals.

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Property Management | Manage multiple properties with occupancy tracking | planned |
| Tenant Portal | Self-service portal for payments and maintenance | planned |
| Rent Collection | Automated rent collection and tracking | planned |
| Maintenance Tracking | Track and manage property maintenance requests | planned |
| Financial Reporting | Generate financial reports and expense tracking | planned |

## Structure

```
@custom/
├── README.md            — This file (product-specific documentation)
├── app.js               — Express entry point (when backend is implemented)
├── config.js            — Environment configuration (when needed)
├── db.js                — Database adapter (when needed)
├── schema.sql           — Database schema (when needed)
└── routes/              — API routes directory
    ├── properties.js    — Property management endpoints
    ├── tenants.js       — Tenant management endpoints
    ├── payments.js      — Payment processing endpoints
    └── maintenance.js   — Maintenance request endpoints
```

## Development Status

**Current Phase:** Bootstrap / Structure Setup  
**Backend Status:** Not yet implemented  
**Landing Page:** ✅ Complete

This directory structure is ready for backend implementation. Once the Nestora backend is developed, place product-specific routes and logic here.

## Routes Architecture (Planned)

### Property Management
- `GET /api/properties` — List all properties
- `POST /api/properties` — Create new property
- `GET /api/properties/:id` — Get property details
- `PUT /api/properties/:id` — Update property
- `DELETE /api/properties/:id` — Delete property

### Tenant Management
- `GET /api/tenants` — List all tenants
- `POST /api/tenants` — Add new tenant
- `GET /api/tenants/:id` — Get tenant details
- `PUT /api/tenants/:id` — Update tenant

### Payments
- `GET /api/payments` — List payment history
- `POST /api/payments` — Process payment
- `GET /api/payments/:id` — Get payment details

### Maintenance
- `GET /api/maintenance` — List maintenance requests
- `POST /api/maintenance` — Create maintenance request
- `PUT /api/maintenance/:id` — Update request status

## Notes

- This directory is product-specific and will not be overwritten by template updates
- Shared/common backend code should go in `@system/` (when full-stack)
- Current state: Landing page only (no backend yet)
- When implementing backend: Follow the structure outlined above

---

**Created:** 2026-03-07  
**Status:** Bootstrap (ready for implementation)  
**Auth Mode:** web2 (email/password)
