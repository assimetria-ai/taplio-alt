# LinkedIn OAuth — Approved @custom Auth Supplement

## Status: ✅ Approved

The `linkedin-oauth` module in `@custom` is an **approved supplementary OAuth integration** for Taplio Alt. It does **not** replace or override the core `@system` authentication (email/password + Google/GitHub OAuth). Instead, it adds LinkedIn account connectivity for authenticated users.

---

## Purpose

Taplio Alt is a LinkedIn content creation and scheduling tool. Users need to **connect their LinkedIn account** to:

- Publish posts to LinkedIn
- Pull engagement analytics (impressions, likes, comments, shares)
- Identify leads from post interactions
- Schedule content for posting

This is a **product-specific OAuth flow** — not a login mechanism. Users must first authenticate via `@system` auth (email/password or OAuth login), then connect their LinkedIn account as a secondary step.

---

## Architecture

### How it fits with @system auth

```
@system/auth (login)          →  User authenticated (JWT session)
@custom/linkedin-oauth        →  User connects LinkedIn account (OAuth 2.0)
```

- **@system auth** handles: registration, login, sessions, password reset, 2FA
- **@custom linkedin-oauth** handles: LinkedIn account linking for content management

### File locations

| File | Purpose |
|------|---------|
| `server/src/api/@custom/linkedin-oauth/index.js` | Full OAuth routes (connect, callback, accounts, refresh, disconnect) |
| `server/src/api/@custom/linkedin-oauth.js` | Simplified stub routes (development/fallback) |
| `server/src/lib/@custom/OAuth/linkedin.js` | LinkedIn API client (token exchange, profile fetch, token refresh) |
| `server/src/db/migrations/@custom/021_linkedin_accounts.js` | Migration: `linkedin_accounts` table |
| `server/src/db/schemas/@custom/linkedin_accounts.sql` | Schema definition for linked LinkedIn accounts |

### API Endpoints

| Method | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| GET | `/api/linkedin/connect` | Yes | Initiates LinkedIn OAuth flow, redirects to LinkedIn |
| GET | `/api/linkedin/callback` | No (state validated) | Handles OAuth callback, stores tokens |
| GET | `/api/linkedin/accounts` | Yes | Lists user's connected LinkedIn accounts |
| POST | `/api/linkedin/accounts/:id/refresh` | Yes | Manually refresh an account's access token |
| DELETE | `/api/linkedin/accounts/:id` | Yes | Disconnect a LinkedIn account |

---

## Security

- **CSRF protection**: State parameter generated per-request, validated on callback
- **Rate limiting**: OAuth endpoints use `oauthLimiter` middleware
- **Token storage**: LinkedIn access/refresh tokens stored encrypted in DB
- **Scoped access**: Only requests LinkedIn scopes needed for content management (`w_member_social`)
- **User-bound**: Each LinkedIn account is linked to a specific authenticated user

---

## Why @custom (not @system)

LinkedIn OAuth for account connectivity is product-specific to Taplio Alt. Other products in the Assimetria portfolio don't need LinkedIn integration. Placing it in `@custom` ensures:

1. **Template sync safety** — `@system` updates won't overwrite it
2. **Clear separation** — Login auth (`@system`) vs. service connectivity (`@custom`)
3. **Portability** — Can be removed without affecting core auth

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKEDIN_CLIENT_ID` | Yes | LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET` | Yes | LinkedIn app client secret |
| `SERVER_URL` | Yes | Base URL for OAuth callback (e.g., `https://taplio-alt.com`) |
| `APP_URL` | Yes | Frontend URL for post-auth redirect |

---

## Approval Notes

- **Approved by**: System architecture review
- **Date**: 2026-03-15
- **Rationale**: LinkedIn account connectivity is a core product requirement for Taplio Alt (LinkedIn content tool). This is a supplementary OAuth flow for service integration, not a replacement for `@system` authentication.
- **Rule**: This module must NOT override, bypass, or replace any `@system` auth behavior. It supplements it.
