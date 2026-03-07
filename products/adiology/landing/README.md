# Adiology Landing Page

This is the landing page for Adiology, built with React, Vite, and Tailwind CSS.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production

The landing page is built as a static site and served via Express:

```bash
# Build the site
npm run build

# Start production server
npm start
```

The production server runs on port 3000 by default (configurable via `PORT` environment variable).

## Product Data

All product information (name, tagline, features, pricing) is imported from `../info.js`. This ensures consistency across all product touchpoints.

## Structure

```
landing/
├── src/
│   ├── App.jsx          — Main landing page component
│   ├── main.jsx         — React entry point
│   └── index.css        — Global styles + Tailwind
├── index.html           — HTML template
├── package.json         — Dependencies and scripts
├── vite.config.js       — Vite configuration
├── tailwind.config.js   — Tailwind configuration
└── server.js            — Production Express server
```

## Deployment

The landing page can be deployed to:
- Vercel (automatic via Git)
- Netlify (automatic via Git)
- Railway (via server.js)
- Any static hosting service

For dynamic deployment (Railway, etc.), use `npm start` which serves the built files via Express.
