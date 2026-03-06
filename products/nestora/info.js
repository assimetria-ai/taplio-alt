// Nestora product metadata
// Central product config — shared source of truth for product information

const PRODUCT_INFO = {
  name: 'Nestora',
  slug: 'nestora',
  description: 'Smart property management and real estate platform',
  tagline: 'Manage properties, tenants, and listings with ease',
  
  cta: {
    title: 'Start Managing Properties Today',
    description: 'Join property managers and real estate professionals who trust Nestora.',
    buttonText: 'Get Started for Free',
  },
  
  url: 'https://nestora.app',
  email: 'hello@nestora.app',
  supportEmail: 'support@nestora.app',
  
  socials: {
    twitter: 'https://twitter.com/nestoraapp',
    github: 'https://github.com/nestora',
  },
  
  theme_color: '#0ea5e9',
  background_color: '#f0f9ff',
  
  links: {
    faq: 'https://nestora.app/help',
    refer_and_earn: 'https://nestora.app/referrals',
    docs: 'https://docs.nestora.app',
  },
  
  pricing: {
    monthly: {
      price: 49,
      description: 'Monthly Subscription',
    },
    yearly: {
      price: 499,
      description: 'Yearly Subscription (2 months free)',
    },
  },
  
  plans: [
    {
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
      price: 49,
      yearlyPrice: 499,
      name: 'Pro',
      description: 'For property managers and real estate professionals',
      features: [
        'Unlimited properties',
        'Tenant management',
        'Automated rent collection',
        'Maintenance tracking',
        'Financial reporting',
        'Priority support',
      ],
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  
  authMode: 'web2', // Options: 'web2' (email/password) or 'web3' (wallet)
  
  features: [
    {
      name: 'Property Management',
      description: 'Manage multiple properties with ease, track occupancy and maintenance',
      icon: 'building',
    },
    {
      name: 'Tenant Portal',
      description: 'Give tenants a self-service portal for payments and maintenance requests',
      icon: 'users',
    },
    {
      name: 'Financial Tracking',
      description: 'Track rent, expenses, and generate financial reports automatically',
      icon: 'chart',
    },
  ],
}

module.exports = PRODUCT_INFO
