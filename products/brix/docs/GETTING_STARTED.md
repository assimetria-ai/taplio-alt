# Getting Started with Brix

**Task #9681 - MVP Implementation Guide**

This guide will walk you through setting up Brix and creating your first storefront.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Installation

### 1. Clone the Repository

```bash
cd products/brix
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Environment Setup

Create `.env` files in both `server/` and `client/` directories:

**server/.env**
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/brix_dev

# App
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:5173

# Auth
JWT_SECRET=your-secret-key-here

# Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**client/.env**
```bash
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:5173
```

### 4. Database Setup

```bash
cd server

# Create database
createdb brix_dev

# Run migrations
npm run db:migrate

# Seed default templates
npm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Visit http://localhost:5173 to see the app.

## Creating Your First Storefront

### Step 1: Sign Up

1. Go to http://localhost:5173/signup
2. Create an account with email and password
3. You'll be redirected to the dashboard

### Step 2: Add Products

1. Click "Products" in the sidebar
2. Click "Add Product"
3. Fill in product details:
   - **Name:** "Sample T-Shirt"
   - **Price:** 29.99
   - **Description:** "Comfortable cotton t-shirt"
   - **Inventory:** 100
   - Upload an image (or use a placeholder)
4. Click "Create Product"

Add 3-5 products to have enough content for your store.

### Step 3: Create Storefront

1. Click "Store" in the sidebar
2. Click "Create Storefront"
3. Enter store name: "My Awesome Store"
4. You'll be taken to the template selector

### Step 4: Choose Template

1. Browse the 4 available templates:
   - **Minimal** - Clean, whitespace-focused
   - **Modern** - Bold typography, vibrant colors
   - **Classic** - Traditional e-commerce layout
   - **Bold** - High-contrast, statement design
2. Click "Preview" to see a full preview
3. Click "Select" on your chosen template

### Step 5: Customize

After selecting a template, you'll see the block editor:

1. **Edit Hero Section:**
   - Change title to your store name
   - Add a subtitle/tagline
   - Upload a hero image (optional)

2. **Customize Colors:**
   - Click "Settings" in the toolbar
   - Choose primary and secondary colors
   - Select fonts

3. **Arrange Blocks:**
   - Drag blocks to reorder
   - Click "+" to add new blocks
   - Click trash icon to remove blocks

4. **Product Display:**
   - Product Grid block shows all your products
   - Adjust grid columns (2, 3, or 4)
   - Toggle price visibility

### Step 6: Preview & Publish

1. Click "Preview" to see your store as visitors will
2. Make any final adjustments
3. Click "Publish" when ready
4. Your store is now live at: `http://localhost:5173/your-store-slug`

## What's Next?

### Immediate (MVP Scope)
- ✅ Add more products
- ✅ Try different templates
- ✅ Customize colors and fonts
- ✅ Rearrange blocks

### Coming Soon (Post-MVP)
- 🚧 Custom domains
- 🚧 Payment integration (Stripe)
- 🚧 Order management
- 🚧 Analytics dashboard
- 🚧 SEO optimization

## API Usage

You can also interact with Brix programmatically:

### Create Product

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Product",
    "description": "A great product",
    "price": 29.99,
    "inventory": 100,
    "status": "active"
  }'
```

### List Templates

```bash
curl http://localhost:3001/api/templates
```

### Create Storefront

```bash
curl -X POST http://localhost:3001/api/storefronts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "template_id": "minimal"
  }'
```

## Testing

```bash
# Run backend tests
cd server
npm test

# Run E2E tests
cd client
npm run test:e2e
```

## Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Manual Deployment

1. Build frontend:
   ```bash
   cd client
   npm run build
   ```

2. Set production environment variables

3. Run migrations on production database

4. Start server:
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
echo $DATABASE_URL
```

### Port Already in Use

```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Template Seed Not Working

```bash
cd server
npm run db:seed -- --specific=default_templates
```

## Support

- **Documentation:** [Full Docs](../README.md)
- **API Reference:** [API.md](./API.md)
- **Block System:** [BLOCKS.md](./BLOCKS.md)
- **Email:** support@getbrix.com

---

**Ready to build?** Start by adding your first product! 🚀
