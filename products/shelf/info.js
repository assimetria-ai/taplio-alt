// Shelf product metadata
// Central product config — shared source of truth for product information

const PRODUCT_INFO = {
  name: 'Shelf',
  slug: 'shelf',
  description: 'Smart content organization and curation platform',
  tagline: 'Organize, curate, and share your digital content beautifully',
  
  cta: {
    title: 'Start Organizing Today',
    description: 'Join creators and teams who trust Shelf to organize their digital content.',
    buttonText: 'Get Started for Free',
  },
  
  url: 'https://shelf.app',
  email: 'hello@shelf.app',
  supportEmail: 'support@shelf.app',
  
  socials: {
    twitter: 'https://twitter.com/shelfapp',
    github: 'https://github.com/shelf',
  },
  
  theme_color: '#4f46e5',
  background_color: '#f8fafc',
  
  links: {
    faq: 'https://shelf.app/help',
    refer_and_earn: 'https://shelf.app/referrals',
    docs: 'https://docs.shelf.app',
  },
  
  pricing: {
    monthly: {
      price: 29,
      description: 'Monthly Subscription',
    },
    yearly: {
      price: 249,
      description: 'Yearly Subscription (2 months free)',
    },
  },
  
  plans: [
    {
      priceId: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
      price: 29,
      yearlyPrice: 249,
      name: 'Pro',
      description: 'For individuals and small teams',
      features: [
        'Unlimited shelves',
        'Advanced organization',
        'Team collaboration',
        'Priority support',
      ],
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  
  authMode: 'web2', // Options: 'web2' (email/password) or 'web3' (wallet)
  
  features: [
    {
      name: 'Smart Organization',
      description: 'Automatically organize your content with AI-powered tagging',
      icon: 'folder',
    },
    {
      name: 'Team Collaboration',
      description: 'Share shelves and collaborate with your team in real-time',
      icon: 'users',
    },
    {
      name: 'Beautiful Curation',
      description: 'Create stunning collections with customizable layouts',
      icon: 'layout',
    },
  ],
}

export default PRODUCT_INFO
