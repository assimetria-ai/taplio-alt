// @custom — Taplio Alt product-specific config
// Override any values from @system/info.ts here.
// This file is NEVER overwritten during template sync.

export const customInfo = {
  name: 'Taplio Alt',
  tagline: 'Schedule smarter, grow your audience.',
  url: import.meta.env.VITE_APP_URL ?? 'https://taplio-web-production.up.railway.app',
  supportEmail: 'support@taplio-alt.com',
}
