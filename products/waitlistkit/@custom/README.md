# @custom - WaitlistKit Custom Backend

This directory contains product-specific backend code for WaitlistKit.

## Purpose

Custom backend routes and logic specific to the WaitlistKit product, including:

- Custom API endpoints
- Product-specific business logic  
- WaitlistKit-specific database models
- Integration with email services

## Current Status

**Status:** Active Product (API in /api directory)  
**Created:** 2026-03-07

## Note on Backend Location

The main WaitlistKit backend API is currently located in:
- `/api/` - Node.js Express server with routes

This `@custom/` directory is reserved for:
- Additional custom routes beyond standard API
- Product-specific utilities
- Future backend extensions
- Custom integrations

## Planned Features

### Future Backend Enhancements

1. **Advanced Analytics**
   - Custom reporting endpoints
   - Data aggregation services
   - Export scheduling

2. **Email Automation**
   - Campaign management
   - Template system
   - Scheduling logic

3. **Integration Hub**
   - Third-party service connectors
   - Webhook management
   - API rate limiting

4. **Advanced Referral System**
   - Multi-tier referral tracking
   - Reward calculation
   - Fraud detection

## Structure

```
@custom/
├── README.md         (this file)
├── routes/           (additional routes - as needed)
├── models/           (database models - as needed)
├── services/         (business logic - as needed)
└── config/           (configuration - as needed)
```

## Development

When implementing:

1. Create route handlers in `routes/`
2. Define data models in `models/`
3. Implement business logic in `services/`
4. Use environment variables for sensitive config

---

**Product:** WaitlistKit  
**Status:** Active (main API in /api/)  
**Last Updated:** 2026-03-07
