# @custom

Product-specific customizations for Taplio Alt go here.

Files in this directory override or extend the `@system` base template.
Any product-specific components, styles, configurations, or overrides
should be placed in this folder.

## Structure

Mirror the `@system` folder structure for overrides:
- `@custom/components/` — Custom React components
- `@custom/styles/` — Custom SCSS overrides
- `@custom/config/` — Product-specific configuration
- `@custom/api/` — Custom API routes

## Approved @custom Supplements

### LinkedIn OAuth (`server/src/api/@custom/linkedin-oauth/`)
- **Status**: Approved
- **Purpose**: Connects authenticated users' LinkedIn accounts for content publishing, scheduling, and analytics
- **NOT a login mechanism** — supplements `@system` auth, does not replace it
- **Docs**: See `docs/LINKEDIN_OAUTH.md` for full architecture and API reference

## Rules
- Never modify `@system` files directly — override in `@custom`
- Template sync updates `@system`; `@custom` is preserved
- LinkedIn OAuth is approved as a supplementary service integration (not core auth)
