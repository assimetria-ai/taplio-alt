// products/planora/info.js - Planora Product Metadata

const PRODUCT_INFO = {
  // Core Identity
  name: 'Planora',
  slug: 'planora',
  tagline: 'Project management that adapts to your team',
  description: 'Beautiful, intuitive project management built for modern teams. Plan, track, and collaborate without the complexity.',

  // Product URLs
  url: 'https://planora.app',
  email: 'hello@planora.app',
  supportEmail: 'support@planora.app',

  // Visual Identity
  theme_color: '#6366f1', // indigo (brand standard)
  background_color: '#0f172a', // slate-900

  // Call to Action
  cta: {
    title: 'Start Planning Smarter',
    description: 'Join thousands of teams using Planora to manage projects with clarity and confidence',
    buttonText: 'Get Started Free'
  },

  // Pricing
  pricing: {
    monthly: 12,
    yearly: 120
  },

  // Plans
  plans: [
    {
      name: 'Free',
      description: 'Perfect for small teams getting started',
      price: 0,
      interval: 'forever',
      features: [
        'Up to 5 team members',
        'Unlimited projects',
        'Basic views (List, Board)',
        'File attachments (100MB)',
        'Mobile apps',
        'Community support'
      ],
      priceId: null
    },
    {
      name: 'Pro',
      description: 'For growing teams that need more power',
      price: 12,
      interval: 'month',
      perUser: true,
      features: [
        'Unlimited team members',
        'All views (Timeline, Calendar, Gantt)',
        'Advanced automations',
        'File attachments (unlimited)',
        'Time tracking',
        'Custom fields',
        'Priority support',
        'Integrations'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID'
    },
    {
      name: 'Enterprise',
      description: 'Advanced security and control for large organizations',
      price: 'Custom',
      interval: 'month',
      features: [
        'Everything in Pro',
        'SSO & SAML',
        'Advanced permissions',
        'Audit logs',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        '24/7 phone support'
      ],
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID'
    }
  ],

  // Features
  features: [
    {
      title: 'Multiple Views',
      description: 'Visualize your work your way: List, Board, Timeline, Calendar, and Gantt chart views',
      icon: '👁️'
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly with live updates, comments, and @mentions',
      icon: '🤝'
    },
    {
      title: 'Smart Automations',
      description: 'Automate repetitive tasks and workflows to focus on what matters',
      icon: '⚡'
    },
    {
      title: 'Custom Fields',
      description: 'Tailor your workspace with custom statuses, tags, dates, and more',
      icon: '🎯'
    },
    {
      title: 'Time Tracking',
      description: 'Track time spent on tasks and generate detailed reports for clients',
      icon: '⏱️'
    },
    {
      title: 'Powerful Integrations',
      description: 'Connect with Slack, GitHub, Google Drive, and 100+ other tools',
      icon: '🔗'
    }
  ],

  // Authentication
  authMode: 'web2', // email/password authentication

  // Social Links
  socials: {
    twitter: 'https://twitter.com/planora',
    linkedin: 'https://linkedin.com/company/planora'
  },

  // Additional Links
  links: {
    faq: 'https://planora.app/faq',
    docs: 'https://docs.planora.app',
    blog: 'https://planora.app/blog',
    changelog: 'https://planora.app/changelog',
    api: 'https://api.planora.app/docs',
    templates: 'https://planora.app/templates'
  }
};

module.exports = { PRODUCT_INFO };
