// products/brix/info.js - Brix Product Metadata
// Product in. Store out.

const PRODUCT_INFO = {
  // Core Identity
  name: 'Brix',
  slug: 'brix',
  tagline: 'Product in. Store out.',
  description: 'No-code storefront builder with block-based UI. Add your products, pick a template, and publish your online store instantly.',

  // Product URLs
  url: 'https://getbrix.com',
  email: 'hello@getbrix.com',
  supportEmail: 'support@getbrix.com',

  // Visual Identity
  theme_color: '#06b6d4', // cyan (blocks/building theme)
  background_color: '#ecfeff', // light cyan

  // Call to Action
  cta: {
    title: 'Build Your Store in Minutes',
    description: 'Join creators selling products with beautiful, instant storefronts',
    buttonText: 'Create Your Store'
  },

  // Pricing
  pricing: {
    free: 0,      // Starter: limited products
    monthly: 29,  // Pro: unlimited products + custom domain
    yearly: 290   // Pro Annual: 2 months free
  },

  // Features (MVP)
  features: {
    mvp: [
      'Product catalog creation',
      'Storefront template selection',
      'Instant publishing',
      'Block-based page builder'
    ],
    planned: [
      'Custom domains',
      'Analytics dashboard',
      'Payment integrations',
      'SEO optimization',
      'Team collaboration'
    ]
  },

  // Social Links
  socials: {
    twitter: 'https://twitter.com/getbrix',
    github: 'https://github.com/getbrix',
  },

  // Product Links
  links: {
    docs: 'https://getbrix.com/docs',
    templates: 'https://getbrix.com/templates',
    faq: 'https://getbrix.com/help',
  },
}

module.exports = PRODUCT_INFO
