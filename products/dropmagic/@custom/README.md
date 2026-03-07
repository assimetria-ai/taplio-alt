# @custom - DropMagic Custom Backend

This directory contains product-specific backend code for DropMagic.

## Purpose

Custom backend routes and logic specific to the DropMagic product, including:

- Custom API endpoints
- Product-specific business logic  
- DropMagic-specific database models
- File management and storage integrations

## Current Status

**Status:** Bootstrap / Placeholder  
**Created:** 2026-03-07  
**Updated:** 2026-03-07 (Task #9393 - Brand color consistency)

## Planned Features

### Core Backend Functionality

1. **File Management API**
   - Upload/download endpoints
   - File metadata management
   - Chunked uploads for large files
   - Resume support

2. **Storage Integration**
   - S3/Cloud storage backend
   - Content delivery network (CDN)
   - File deduplication
   - Compression and optimization

3. **Organization System**
   - AI-powered auto-tagging
   - Smart folders and collections
   - Full-text search indexing
   - File relationship tracking

4. **Sharing & Permissions**
   - Shareable link generation
   - Access control and permissions
   - Expiration and password protection
   - Download tracking

5. **Collaboration Features**
   - Real-time co-editing
   - Comments and annotations
   - Version history
   - Activity feeds

6. **Security & Compliance**
   - Encryption at rest and in transit
   - Audit logging
   - GDPR compliance tools
   - Backup and disaster recovery

## Structure

```
@custom/
├── README.md         (this file)
├── routes/           (API routes - to be created)
├── models/           (database models - to be created)
├── services/         (business logic - to be created)
└── config/           (configuration - to be created)
```

## Development

When implementing:

1. Create route handlers in `routes/`
2. Define data models in `models/`
3. Implement business logic in `services/`
4. Use environment variables for sensitive config

---

**Product:** DropMagic  
**Status:** Awaiting implementation  
**Last Updated:** 2026-03-07
