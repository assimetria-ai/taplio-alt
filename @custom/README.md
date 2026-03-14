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

## Rules
- Never modify `@system` files directly — override in `@custom`
- Template sync updates `@system`; `@custom` is preserved
