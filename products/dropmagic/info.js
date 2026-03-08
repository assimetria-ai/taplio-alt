// products/dropmagic/info.js - DropMagic Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'DropMagic',
  slug: 'dropmagic',
  tagline: 'File management made magical',
  description: 'Smart file organization, sharing, and collaboration platform. Drag, drop, and watch the magic happen.',
  
  // Competitive Differentiator
  differentiator: 'AI-powered automatic file organization that eliminates manual sorting. While competitors like Dropbox, Google Drive, and OneDrive require users to manually organize files into folders, DropMagic uses machine learning to automatically categorize, tag, and organize files based on content, context, and usage patterns - making file management truly effortless.',

  // Product URLs
  url: 'https://dropmagic.io',
  email: 'hello@dropmagic.io',
  supportEmail: 'support@dropmagic.io',

  // Visual Identity
  theme_color: '#7C3AED', // purple (brand standard)
  background_color: '#faf5ff', // light purple

  // Call to Action
  cta: {
    title: 'Experience the Magic of File Management',
    description: 'Join thousands of teams using DropMagic to organize and share files effortlessly',
    buttonText: 'Start Free Trial'
  },

  // Pricing
  pricing: {
    monthly: 9,
    yearly: 99
  },

  // Plans
  plans: [
    {
      name: 'Personal',
      description: 'Perfect for individuals',
      price: 9,
      interval: 'month',
      features: [
        '100 GB storage',
        'Unlimited uploads',
        'Smart organization',
        'File sharing',
        'Mobile apps',
        'Email support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Team',
      description: 'For small teams and businesses',
      price: 29,
      interval: 'month',
      features: [
        '1 TB storage',
        'Everything in Personal',
        'Team collaboration',
        'Advanced sharing',
        'Admin controls',
        'Priority support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Business',
      description: 'For larger organizations',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited storage',
        'Everything in Team',
        'Advanced security',
        'SSO integration',
        'API access',
        'Dedicated support',
        'SLA guarantee'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    }
  ],

  // Features
  features: [
    {
      title: 'Smart Organization',
      description: 'AI-powered file organization that automatically categorizes and tags your files',
      icon: '🪄'
    },
    {
      title: 'Instant Sharing',
      description: 'Share files and folders with anyone using secure, customizable links',
      icon: '🔗'
    },
    {
      title: 'Team Collaboration',
      description: 'Work together in real-time with comments, annotations, and version control',
      icon: '👥'
    },
    {
      title: 'Universal Access',
      description: 'Access your files from any device with native apps for web, mobile, and desktop',
      icon: '📱'
    },
    {
      title: 'Advanced Security',
      description: 'Enterprise-grade encryption, permissions, and compliance features',
      icon: '🔒'
    },
    {
      title: 'Powerful Search',
      description: 'Find anything instantly with full-text search and smart filters',
      icon: '🔍'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links (optional)
  socials: {
    twitter: 'https://twitter.com/dropmagic',
    github: 'https://github.com/dropmagic'
  },

  // Additional Links
  links: {
    faq: 'https://dropmagic.io/faq',
    docs: 'https://docs.dropmagic.io',
    blog: 'https://dropmagic.io/blog',
    api: 'https://api.dropmagic.io/docs'
  }
};

module.exports = { PRODUCT_INFO };
