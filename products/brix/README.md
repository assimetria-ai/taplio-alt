# Brix - Storefront Builder MVP

**Tagline:** Product in. Store out.

**Status:** MVP Implementation (Task #9681)  
**Created:** 2026-03-08

## Overview

Brix is a no-code storefront builder that lets creators launch online stores in minutes. Add products, choose a template, and publish instantly with a block-based page builder.

## MVP Features (Task #9681)

### ✅ 1. Product Catalog Creation
- Create and manage product listings
- Product attributes:
  - Name, description, price
  - Images (single or gallery)
  - SKU, inventory tracking
  - Categories/tags
- Bulk import/export
- Product variants (size, color, etc.)

### ✅ 2. Storefront Template Selection
- Pre-designed storefront templates
- Template categories:
  - Minimal
  - Modern
  - Classic
  - Bold
- Live preview before selection
- Template customization:
  - Colors, fonts, logo
  - Layout options
  - Block arrangement

### 🚧 Planned for v2
- Custom domains
- Payment integrations (Stripe, PayPal)
- Analytics dashboard
- SEO optimization
- Team collaboration
- Inventory management
- Order management
- Customer accounts
- Email marketing integration
- Social media integration

## Architecture

### Database Schema

#### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  sku VARCHAR(100),
  inventory INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
```

#### Storefronts Table
```sql
CREATE TABLE storefronts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  template_id VARCHAR(100) NOT NULL,
  custom_domain VARCHAR(255),
  settings JSONB DEFAULT '{}'::jsonb,
  blocks JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_storefronts_user_id ON storefronts(user_id);
CREATE INDEX idx_storefronts_slug ON storefronts(slug);
CREATE INDEX idx_storefronts_status ON storefronts(status);
```

#### Templates Table
```sql
CREATE TABLE templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  preview_image VARCHAR(500),
  default_blocks JSONB NOT NULL,
  default_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active);
```

### API Endpoints

#### Products API
```
GET    /api/products                 - List user's products
POST   /api/products                 - Create product
GET    /api/products/:id             - Get product details
PATCH  /api/products/:id             - Update product
DELETE /api/products/:id             - Delete product
POST   /api/products/import          - Bulk import (CSV/JSON)
GET    /api/products/export          - Export products
```

#### Storefronts API
```
GET    /api/storefronts              - List user's storefronts
POST   /api/storefronts              - Create storefront
GET    /api/storefronts/:id          - Get storefront details
PATCH  /api/storefronts/:id          - Update storefront
DELETE /api/storefronts/:id          - Delete storefront
POST   /api/storefronts/:id/publish  - Publish storefront
GET    /api/storefronts/:id/preview  - Preview draft
```

#### Templates API
```
GET    /api/templates                - List available templates
GET    /api/templates/:id            - Get template details
GET    /api/templates/:id/preview    - Preview template
```

#### Public Storefront
```
GET    /:slug                        - Public storefront view
GET    /:slug/products/:productSlug  - Product detail page
```

## Default Templates (MVP)

### 1. Minimal
- Clean, whitespace-focused design
- Single-column product grid
- Monochrome color scheme
- Sans-serif typography

### 2. Modern
- Bold typography
- Multi-column grid
- Vibrant accents
- Image-forward layout

### 3. Classic
- Traditional e-commerce layout
- Sidebar navigation
- Serif headings
- Structured product cards

### 4. Bold
- Large hero sections
- High-contrast colors
- Statement typography
- Asymmetric layouts

## Block System

### Core Blocks (MVP)
```javascript
const CORE_BLOCKS = {
  hero: { type: 'hero', title: '', subtitle: '', image: '', cta: {} },
  productGrid: { type: 'productGrid', columns: 3, products: 'all' },
  productFeatured: { type: 'productFeatured', productId: null },
  text: { type: 'text', content: '', alignment: 'left' },
  image: { type: 'image', src: '', alt: '', caption: '' },
  spacer: { type: 'spacer', height: 40 },
  divider: { type: 'divider', style: 'solid' },
}
```

### Example Storefront Configuration
```json
{
  "settings": {
    "primaryColor": "#06b6d4",
    "font": "Inter",
    "logo": "https://...",
    "favicon": "https://..."
  },
  "blocks": [
    { "type": "hero", "title": "Welcome to My Store", "subtitle": "..." },
    { "type": "productGrid", "columns": 3, "products": "all" },
    { "type": "text", "content": "About Us..." }
  ]
}
```

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT authentication
- Cloudinary (image uploads)

### Frontend
- React
- Tailwind CSS
- React Query (data fetching)
- Zustand (state management)
- React DnD (block editor)

## Development Roadmap

### ✅ Phase 1: MVP (Current - Task #9681)
- [ ] Database migrations
- [ ] Product CRUD API
- [ ] Storefront CRUD API
- [ ] Template system
- [ ] Product catalog UI
- [ ] Template selection UI
- [ ] Basic block editor
- [ ] Public storefront renderer

### 🚧 Phase 2: Publishing & Polish
- [ ] Custom domains
- [ ] SEO metadata
- [ ] Mobile-responsive templates
- [ ] Performance optimization
- [ ] Analytics basics

### 🔮 Phase 3: Commerce
- [ ] Payment integrations
- [ ] Order management
- [ ] Inventory tracking
- [ ] Email notifications
- [ ] Customer accounts

## File Structure

```
products/brix/
├── README.md                    (this file)
├── info.js                      (product metadata)
├── @system/
│   └── README.md                (system utilities)
├── @custom/
│   ├── migrations/
│   │   ├── 001_products.js
│   │   ├── 002_storefronts.js
│   │   └── 003_templates.js
│   ├── api/
│   │   ├── products.js
│   │   ├── storefronts.js
│   │   └── templates.js
│   ├── ui/
│   │   ├── ProductCatalog.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── BlockEditor.tsx
│   │   └── StorefrontRenderer.tsx
│   └── seeds/
│       └── default_templates.js
└── docs/
    ├── GETTING_STARTED.md
    ├── TEMPLATES.md
    └── BLOCKS.md
```

## Getting Started

### 1. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed default templates
npm run db:seed
```

### 2. Development
```bash
# Start backend server
cd server && npm run dev

# Start frontend dev server
cd client && npm run dev
```

### 3. Create Your First Store
1. Sign up / log in
2. Go to "Products" → "Add Product"
3. Fill in product details, upload images
4. Go to "Store" → "Choose Template"
5. Pick a template, customize colors/fonts
6. Arrange blocks in your storefront
7. Click "Publish" to go live

## Testing

```bash
# Run API tests
npm test

# E2E tests
npm run test:e2e
```

## Deployment

```bash
# Build frontend
npm run build

# Deploy (Railway)
railway up
```

## Support

- **Documentation:** https://getbrix.com/docs
- **Email:** support@getbrix.com
- **Community:** https://discord.gg/brix

---

**Product:** Brix  
**Task:** #9681  
**Status:** MVP Implementation  
**Created:** 2026-03-08
