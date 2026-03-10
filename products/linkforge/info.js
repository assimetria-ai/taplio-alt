// products/linkforge/info.js - Product Metadata

module.exports = {
  id: 'linkforge',
  name: 'LinkForge',
  description: 'URL shortener with analytics and link management',
  version: '1.0.0',
  status: 'development',
  
  features: [
    'Short link generation',
    'Custom slug support',
    'Click analytics',
    'User management',
    'Geolocation tracking',
    'Referrer tracking'
  ],
  
  tech: {
    backend: 'Node.js + Express',
    frontend: 'React + Vite',
    database: 'PostgreSQL + Prisma',
    auth: 'JWT'
  },
  
  deployment: {
    railway: true,
    vercel: false,
    netlify: false
  },
  
  repository: null,
  documentation: 'README.md',
  
  team: {
    owner: 'anton',
    contributors: []
  },
  
  created: new Date('2024-03-10'),
  updated: new Date('2024-03-10')
};
