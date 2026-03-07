// products/aide/info.js - Aide Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'Aide',
  slug: 'aide',
  tagline: 'AI-powered development assistant platform',
  description: 'Intelligent coding assistant that helps developers write better code faster',

  // Product URLs
  url: 'https://aide.app',
  email: 'hello@aide.app',
  supportEmail: 'support@aide.app',

  // Visual Identity
  theme_color: '#3b82f6', // blue
  background_color: '#eff6ff', // light blue

  // Call to Action
  cta: {
    title: 'Start Coding Smarter Today',
    description: 'Join thousands of developers using AI to accelerate their workflow',
    buttonText: 'Get Started Free'
  },

  // Pricing
  pricing: {
    monthly: 19,
    yearly: 199
  },

  // Plans
  plans: [
    {
      name: 'Developer',
      description: 'Perfect for individual developers',
      price: 19,
      interval: 'month',
      features: [
        'AI code completion',
        'Code review assistance',
        'Documentation generation',
        'Bug detection',
        '24/7 support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    }
  ],

  // Features
  features: [
    {
      title: 'Smart Code Completion',
      description: 'AI-powered suggestions that understand your codebase context',
      icon: '🤖'
    },
    {
      title: 'Automated Code Review',
      description: 'Get instant feedback on code quality and best practices',
      icon: '✨'
    },
    {
      title: 'Documentation Assistant',
      description: 'Generate comprehensive documentation automatically',
      icon: '📚'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links (optional)
  socials: {
    twitter: 'https://twitter.com/aide',
    github: 'https://github.com/aide'
  },

  // Additional Links
  links: {
    faq: 'https://aide.app/faq',
    docs: 'https://docs.aide.app',
    referral: 'https://aide.app/refer'
  }
};

module.exports = { PRODUCT_INFO };
