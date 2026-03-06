# Nestora Landing Page

Smart property management and real estate platform landing page.

## About Nestora

Nestora is a comprehensive property management platform designed for real estate professionals, property managers, and landlords. It provides tools for:

- Property portfolio management
- Tenant management and communication
- Automated rent collection
- Maintenance request tracking
- Financial reporting and analytics
- Document management

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   └── LandingPage.jsx    # Main landing page component
├── App.jsx                # Root component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

## Features

The landing page showcases:

- **Hero Section**: Eye-catching introduction to Nestora
- **Features Section**: Key features and benefits
- **Pricing Section**: Transparent pricing information
- **CTA Section**: Clear call-to-action for sign-ups

## Tech Stack

- **React**: ^18.3.1
- **Vite**: ^5.4.5 - Build tool and dev server
- **Tailwind CSS**: ^3.4.11 - Utility-first CSS framework
- **ESLint**: Code quality and consistency

## Product Information

All product metadata is centralized in `products/nestora/info.js`, making it easy to maintain consistency across the platform.

## Deployment

The landing page can be deployed to any static hosting service:

- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

## License

Private - All rights reserved
