// products/broadr/info.js - Broadr Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'Broadr',
  slug: 'broadr',
  tagline: 'Broadcast your message across multiple channels',
  description: 'Reach your audience wherever they are. Multi-channel broadcasting platform for SMS, email, push notifications, and social media—all from one place.',

  // Product URLs
  url: 'https://broadr.app',
  email: 'hello@broadr.app',
  supportEmail: 'support@broadr.app',

  // Visual Identity
  theme_color: '#9333ea', // purple
  background_color: '#1e1b4b', // dark purple/slate

  // Call to Action
  cta: {
    title: 'Start Broadcasting Today',
    description: 'Join thousands of businesses using Broadr to reach their audience across all channels',
    buttonText: 'Get Started'
  },

  // Pricing
  pricing: {
    monthly: 49,
    yearly: 499
  },

  // Plans
  plans: [
    {
      name: 'Starter',
      description: 'Perfect for small teams and growing businesses',
      price: 49,
      interval: 'month',
      features: [
        '10,000 messages/month',
        'SMS + Email',
        'Push notifications',
        'Basic analytics',
        'Template library',
        'Email support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Professional',
      description: 'For businesses that need more reach',
      price: 149,
      interval: 'month',
      features: [
        '50,000 messages/month',
        'All channels (SMS, Email, Push, Social)',
        'Advanced analytics',
        'A/B testing',
        'Custom templates',
        'Priority support',
        'API access'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Enterprise',
      description: 'Unlimited broadcasting with premium features',
      price: 499,
      interval: 'month',
      features: [
        'Unlimited messages',
        'All channels',
        'White-label option',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    }
  ],

  // Features
  features: [
    {
      title: 'Multi-Channel Broadcasting',
      description: 'Send messages across SMS, email, push notifications, and social media from one unified platform',
      icon: '📱'
    },
    {
      title: 'Smart Scheduling',
      description: 'Schedule broadcasts for optimal engagement times with intelligent timezone detection',
      icon: '⏰'
    },
    {
      title: 'Analytics & Insights',
      description: 'Track delivery rates, opens, clicks, and conversions across all channels in real-time',
      icon: '📊'
    },
    {
      title: 'Template Library',
      description: 'Pre-built templates for common use cases, fully customizable to match your brand',
      icon: '📝'
    },
    {
      title: 'A/B Testing',
      description: 'Test different messages and find what resonates best with your audience',
      icon: '🧪'
    },
    {
      title: 'API Integration',
      description: 'Powerful REST API for seamless integration with your existing tools and workflows',
      icon: '🔌'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links (optional)
  socials: {
    twitter: 'https://twitter.com/broadr',
    github: 'https://github.com/broadr'
  },

  // Additional Links
  links: {
    faq: 'https://broadr.app/faq',
    docs: 'https://docs.broadr.app',
    blog: 'https://broadr.app/blog',
    api: 'https://api.broadr.app/docs'
  }
};

module.exports = { PRODUCT_INFO };
