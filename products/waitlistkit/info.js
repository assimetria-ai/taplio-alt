// products/waitlistkit/info.js - WaitlistKit Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'WaitlistKit',
  slug: 'waitlistkit',
  tagline: 'Beautiful waitlist management for your next launch',
  description: 'Collect, manage, and engage with your early adopters. Built for makers who care about the launch experience.',

  // Product URLs
  url: 'https://waitlistkit.com',
  email: 'hello@waitlistkit.com',
  supportEmail: 'support@waitlistkit.com',

  // Visual Identity
  theme_color: '#6366f1', // indigo
  background_color: '#f0f9ff', // light blue

  // Call to Action
  cta: {
    title: 'Start Building Your Waitlist Today',
    description: 'Join thousands of makers using WaitlistKit to build excitement before launch',
    buttonText: 'Start Free Trial'
  },

  // Pricing
  pricing: {
    monthly: 29,
    yearly: 299
  },

  // Plans
  plans: [
    {
      name: 'Starter',
      description: 'Perfect for indie makers and small teams',
      price: 29,
      interval: 'month',
      features: [
        'Unlimited signups',
        'Customizable forms',
        'Analytics dashboard',
        'Referral tracking',
        'Email notifications',
        'CSV export'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    },
    {
      name: 'Pro',
      description: 'For growing products with advanced needs',
      price: 79,
      interval: 'month',
      features: [
        'Everything in Starter',
        'Email campaigns',
        'Custom branding',
        'Priority support',
        'API access',
        'Advanced analytics'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID' // Placeholder
    }
  ],

  // Features
  features: [
    {
      title: 'Easy Signup Forms',
      description: 'Embed beautiful waitlist forms anywhere. Fully customizable and mobile-ready.',
      icon: '📝'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track signups, conversion rates, and referral performance in real-time.',
      icon: '📊'
    },
    {
      title: 'Referral System',
      description: 'Turn your waitlist into a growth engine with built-in referral tracking.',
      icon: '🎯'
    },
    {
      title: 'Email Campaigns',
      description: 'Keep your audience engaged with automated email sequences.',
      icon: '✉️'
    },
    {
      title: 'Custom Branding',
      description: 'Make it yours with custom colors, logos, and domain.',
      icon: '🎨'
    },
    {
      title: 'Export & Integration',
      description: 'Export data to CSV or integrate with your favorite tools via API.',
      icon: '🔌'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links (optional)
  socials: {
    twitter: 'https://twitter.com/waitlistkit',
    github: 'https://github.com/waitlistkit'
  },

  // Additional Links
  links: {
    faq: 'https://waitlistkit.com/faq',
    docs: 'https://docs.waitlistkit.com',
    referral: 'https://waitlistkit.com/refer',
    blog: 'https://waitlistkit.com/blog'
  }
};

module.exports = { PRODUCT_INFO };
