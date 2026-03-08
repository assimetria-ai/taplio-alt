# Nestora — @custom/

Product-specific implementation for Nestora. This directory is **never touched by template sync** (`@system/` syncs automatically; `@custom/` is yours).

## Product Overview

Nestora is a smart property management and real estate platform designed for property managers, landlords, and real estate professionals.

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Property Listing CRUD | Create, read, update, delete property listings | ✅ **Complete** |
| Photo Upload | Upload and manage property photos (max 10 per property) | ✅ **Complete** |
| Full-Text Search | Search properties by title, description, address, city | ✅ **Complete** |
| Filtering | Filter by status, type, price range, city | ✅ **Complete** |
| Tenant Portal | Self-service portal for payments and maintenance | planned |
| Rent Collection | Automated rent collection and tracking | planned |
| Maintenance Tracking | Track and manage property maintenance requests | planned |
| Financial Reporting | Generate financial reports and expense tracking | planned |

## Structure

```
@custom/
├── README.md            — This file (product-specific documentation)
├── API.md               — API documentation and endpoints
├── app.js               — ✅ Express entry point
├── db.js                — ✅ Database adapter (SQLite with better-sqlite3)
├── schema.sql           — ✅ Database schema with FTS support
├── package.json         — ✅ Backend dependencies
├── nestora.db           — SQLite database (created on first run)
└── routes/              — API routes directory
    ├── properties.js    — ✅ Property management endpoints (CRUD + photos + search)
    ├── tenants.js       — Tenant management endpoints (stub)
    ├── payments.js      — Payment processing endpoints (stub)
    └── maintenance.js   — Maintenance request endpoints (stub)
```

## Development Status

**Current Phase:** Backend Implementation Complete (Task #9680)  
**Backend Status:** ✅ Implemented  
**Landing Page:** ✅ Complete

The Nestora backend API is fully functional with property listing CRUD operations, photo upload, and full-text search capabilities.

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

## Quick Start

### Install Dependencies

```bash
cd products/nestora/@custom
npm install
```

### Initialize Database

```bash
npm run init-db
```

### Start Backend Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The API will be available at `http://localhost:3001/api`

### API Documentation

See [API.md](./API.md) for complete endpoint documentation and examples.

### Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Create a property
curl -X POST http://localhost:3001/api/properties \
  -F "title=Test Property" \
  -F "address=123 Main St" \
  -F "city=Portland" \
  -F "state=OR" \
  -F "zip_code=97201" \
  -F "property_type=house"

# List properties
curl http://localhost:3001/api/properties

# Search properties
curl "http://localhost:3001/api/properties?q=Portland&type=house"
```

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **File Upload:** Multer
- **Search:** SQLite FTS5 (Full-Text Search)

## Notes

- This directory is product-specific and will not be overwritten by template updates
- Backend uses SQLite for simplicity (production should use PostgreSQL/MySQL)
- Photo uploads are stored locally in `../uploads/` directory
- Full-text search provides instant results for property search
- First uploaded photo automatically becomes the primary photo

---

**Created:** 2026-03-07  
**Updated:** 2026-03-08 (Task #9680 completed)  
**Status:** ✅ Backend Complete  
**Auth Mode:** web2 (email/password)
