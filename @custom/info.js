// @custom — Taplio Alt product configuration
// Overrides .config/info.js defaults

const GENERAL_INFO = {
  name: 'Taplio Alt',
  description: 'Schedule smarter, grow your audience — AI-powered LinkedIn content creation, scheduling, and lead generation.',
  cta: {
    title: 'Grow Your LinkedIn Presence',
    description: 'Create scroll-stopping posts, schedule at peak times, and turn engagement into leads — all powered by AI.',
    buttonText: 'Get Started Free',
  },
  url: 'https://taplio-alt.com',
  email: 'hello@taplio-alt.com',
  supportEmail: 'support@taplio-alt.com',
  socials: [],
  theme_color: '#0891B2',
  background_color: '#ECFEFF',
  links: {
    faq: 'https://taplio-alt.com/faq',
    refer_and_earn: 'https://taplio-alt.com/refer',
  },
  products: {
    monthly: {
      price: 29,
      description: 'Monthly Subscription',
    },
    yearly: {
      price: 290,
      description: 'Yearly Subscription',
    },
  },
  plans: [
    {
      priceId: 'price_REPLACE_ME',
      price: 29,
      yearlyPrice: 290,
      name: 'Pro',
      description: 'Pro Plan — AI post writer, smart scheduling, analytics, lead generation, content templates',
      paymentLink: '',
      noAllowedRoutes: [],
    },
  ],
  authMode: 'web2',
  emailProvider: 'resend',
}

module.exports = GENERAL_INFO
