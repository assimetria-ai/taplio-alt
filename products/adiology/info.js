// Adiology product metadata
// Central product config — shared source of truth for product information

const PRODUCT_INFO = {
  name: 'Adiology',
  slug: 'adiology',
  description: 'Professional radio streaming and podcast platform for creators and broadcasters',
  tagline: 'Build your radio station, grow your audience',
  
  cta: {
    title: 'Start Broadcasting Today',
    description: 'Join thousands of radio creators and podcasters who trust Adiology.',
    buttonText: 'Get Started for Free',
  },
  
  url: 'https://adiology.app',
  email: 'hello@adiology.app',
  supportEmail: 'support@adiology.app',
  
  socials: {
    twitter: 'https://twitter.com/adiologyapp',
    github: 'https://github.com/adiology',
  },
  
  theme_color: '#8b5cf6',
  background_color: '#faf5ff',
  
  links: {
    faq: 'https://adiology.app/help',
    refer_and_earn: 'https://adiology.app/referrals',
    docs: 'https://docs.adiology.app',
  },
  
  pricing: {
    monthly: {
      price: 29,
      description: 'Monthly Subscription',
    },
    yearly: {
      price: 299,
      description: 'Yearly Subscription (2 months free)',
    },
  },
  
  plans: [
    {
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
      price: 29,
      yearlyPrice: 299,
      name: 'Creator',
      description: 'For radio creators and podcasters',
      features: [
        'Unlimited streaming hours',
        'HD audio quality',
        'Live broadcasting',
        'Podcast hosting',
        'Analytics dashboard',
        'Priority support',
      ],
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  
  authMode: 'web2', // Options: 'web2' (email/password) or 'web3' (wallet)
  
  features: [
    {
      name: 'Live Broadcasting',
      description: 'Stream live radio shows with professional-grade audio quality',
      icon: 'radio',
    },
    {
      name: 'Podcast Hosting',
      description: 'Host and distribute your podcasts across all major platforms',
      icon: 'mic',
    },
    {
      name: 'Analytics',
      description: 'Track listeners, engagement, and grow your audience with insights',
      icon: 'chart',
    },
  ],
}

export default PRODUCT_INFO
