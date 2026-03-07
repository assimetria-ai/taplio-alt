// products/flint/info.js - Flint Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'Flint',
  slug: 'flint',
  tagline: 'Spark your next great project',
  description: 'Project starter platform that helps you ignite new ideas and turn them into reality with templates, tools, and community support.',

  // Product URLs
  url: 'https://flint.app',
  email: 'hello@flint.app',
  supportEmail: 'support@flint.app',

  // Visual Identity
  theme_color: '#ea580c', // orange (fire)
  background_color: '#fff7ed', // light orange

  // Call to Action
  cta: {
    title: 'Start Your Project Today',
    description: 'Join thousands of makers using Flint to turn ideas into reality',
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
      name: 'Starter',
      description: 'Perfect for indie makers and hobbyists',
      price: 19,
      interval: 'month',
      features: [
        '10 active projects',
        'Basic templates',
        'Community access',
        'Project roadmaps',
        'Collaboration tools',
        'Email support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Pro',
      description: 'For serious builders and small teams',
      price: 49,
      interval: 'month',
      features: [
        'Unlimited projects',
        'Premium templates',
        'Advanced tools',
        'Team collaboration',
        'Priority support',
        'Custom integrations',
        'Analytics dashboard'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    }
  ],

  // Features
  features: [
    {
      title: 'Project Templates',
      description: 'Pre-built templates for web apps, mobile apps, SaaS, and more to get you started fast',
      icon: '📋'
    },
    {
      title: 'Idea Validation',
      description: 'Tools to validate your idea with market research, surveys, and competitor analysis',
      icon: '💡'
    },
    {
      title: 'Roadmap Planning',
      description: 'Visual roadmap builder to plan milestones, features, and timelines',
      icon: '🗺️'
    },
    {
      title: 'Resource Library',
      description: 'Curated collection of tools, frameworks, and guides for every stage of building',
      icon: '📚'
    },
    {
      title: 'Community Support',
      description: 'Connect with other builders, get feedback, and find collaborators',
      icon: '👥'
    },
    {
      title: 'Progress Tracking',
      description: 'Track your progress with milestones, metrics, and achievement badges',
      icon: '📊'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links (optional)
  socials: {
    twitter: 'https://twitter.com/flintapp',
    github: 'https://github.com/flint'
  },

  // Additional Links
  links: {
    faq: 'https://flint.app/faq',
    docs: 'https://docs.flint.app',
    blog: 'https://flint.app/blog',
    community: 'https://community.flint.app'
  }
};

module.exports = { PRODUCT_INFO };
