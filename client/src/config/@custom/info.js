// @custom — Planora product-specific config
// Override any values from @system/info.ts here.
// This file is NEVER overwritten during template sync.

export const customInfo = {
  name: 'Planora',
  tagline: 'Plan smarter. Ship faster.',
  url: import.meta.env.VITE_APP_URL ?? 'https://planora-site-production.up.railway.app',
  supportEmail: 'support@planora.com',
}
