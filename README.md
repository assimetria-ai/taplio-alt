# Product Template

**Assimetria's foundational scaffold for spinning up new products**

> Internal tooling for Assimetria agents and operators. This template provides a consistent, production-ready foundation for building SaaS products within the Assimetria OS ecosystem.

---

## Purpose

The Product Template is the starting point for all Assimetria products. It solves the "blank slate problem" by providing:

1. **Consistent architecture** — All products share the same structure, making agent handoffs seamless
2. **Battle-tested patterns** — Auth, database, payments, and deployment are solved once, reused everywhere
3. **Fast iteration** — Bootstrap a new product in minutes, not days
4. **Maintainability** — Template updates (`@system`) propagate to all products via sync workflow

**Not a framework.** This is a scaffold — fork it, customize it, ship it.

---

## What's Included

### Frontend (React + Vite)

- **shadcn/ui** — High-quality, accessible components (not a dependency, you own the code)
- **Tailwind CSS** — Utility-first styling
- **React Router** — Client-side routing with protected routes
- **Lucide React** — Beautiful, consistent icons
- **JWT authentication** — Secure, stateless sessions

### Backend (Node.js + Express)

- **PostgreSQL** — Relational database via `pg-promise`
- **JWT sessions** — Secure authentication with RS256 signing
- **API scaffolding** — Pagination, search, and CRUD helpers for rapid API development
- **Stripe integration** — Subscription billing ready to go
- **Email** — AWS SES for transactional emails
- **Rate limiting** — IP-based protection on sensitive endpoints
- **CORS configured** — Secure cross-origin setup
- **Encryption** — AES-256 for sensitive data at rest

### DevOps & Tooling

- **Railway deployment** — One-click deploy config included
- **Docker support** — Containerized for portability
- **E2E tests (Playwright)** — Automated browser testing
- **Webpack fallback** — Alternative bundler config
- **Bootstrap scripts** — Auto-generate crypto keys, copy env files

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Client** | React 18 + Vite | Fast dev server, modern JSX transform, lightning builds |
| **UI Library** | shadcn/ui | High-quality components you own (not a dep), built on Radix UI primitives |
| **Styling** | Tailwind CSS | Utility-first, consistent design tokens, tiny production CSS |
| **Icons** | Lucide React | Beautiful, MIT-licensed, tree-shakeable |
| **Server** | Node.js 20+ | JavaScript everywhere, huge ecosystem |
| **Framework** | Express 4.x | Minimal, flexible, battle-tested |
| **Database** | PostgreSQL 15+ | ACID compliance, JSON support, mature tooling |
| **DB Client** | pg-promise | Promise-based, query builder, prepared statements |
| **Auth** | JWT (RS256) | Stateless, scalable, asymmetric key signing |
| **Payments** | Stripe | Industry standard, excellent API, global support |
| **Email** | AWS SES | Reliable, cheap ($0.10/1k emails), high deliverability |
| **Deployment** | Railway | Zero-config deploys, preview environments, PostgreSQL included |
| **E2E Testing** | Playwright | Cross-browser, reliable selectors, trace debugging |

---

## Project Structure

```
product-template/
├── client/                    # React (Vite) SPA
│   ├── src/
│   │   ├── App.jsx            # Root component
│   │   ├── main.jsx           # Vite entry point
│   │   └── app/
│   │       ├── api/@system/   # API wrappers (fetch with auth)
│   │       ├── components/    # UI components
│   │       │   ├── @system/   # Template components (Header, Footer, etc.)
│   │       │   └── @custom/   # Your product components go here
│   │       ├── hooks/         # React hooks (useAuth, etc.)
│   │       ├── lib/@system/   # Utilities (cn, api client)
│   │       ├── pages/
│   │       │   ├── app/       # Authenticated pages (/app/*)
│   │       │   └── static/    # Public pages (/, /pricing, /blog)
│   │       ├── routes/        # React Router definitions
│   │       ├── store/         # Global state management
│   │       └── config/        # Product branding, env vars
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js API
│   ├── src/
│   │   ├── app.js             # Express app factory
│   │   ├── index.js           # Server entry point
│   │   ├── api/
│   │   │   ├── @system/       # Template endpoints (auth, billing, admin)
│   │   │   └── @custom/       # Your product endpoints go here
│   │   ├── config/@system/    # Server config (database, Stripe, SES)
│   │   ├── db/
│   │   │   ├── repos/@system/ # Data access layer (pg-promise)
│   │   │   ├── schemas/@system/ # SQL schema definitions
│   │   │   └── migrations/    # Database migrations
│   │   ├── lib/@system/       # Integrations (PostgreSQL, Stripe, SES)
│   │   ├── routes/            # Express router registration
│   │   ├── scheduler/         # Cron jobs
│   │   └── workers/           # Background jobs
│   ├── package.json
│   └── .env.example
│
├── e2e/                       # Playwright E2E tests
│   ├── @system/               # Template test suites
│   │   ├── 01-public-pages.spec.ts
│   │   ├── 02-auth.spec.ts
│   │   ├── 03-navigation.spec.ts
│   │   └── 04-accessibility.spec.ts
│   ├── @custom/               # Your product tests go here
│   └── fixtures/              # Test helpers
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # System design
│   ├── QA.md                  # Testing strategy
│   ├── RUNBOOK.md             # Ops guide
│   ├── railway-deploy.md      # Railway deployment
│   └── webpack-setup.md       # Alternative bundler
│
├── scripts/                   # Dev & ops scripts
│   └── @system/dev/
│       ├── bootstrap.js       # Generate keys, copy env files
│       └── generate-keys.js   # Crypto key generation
│
├── package.json               # Root workspace scripts
├── docker-compose.yml         # Local dev containers
└── playwright.config.js       # E2E test config
```

---

## Conventions: `@system` vs `@custom`

The template uses a clear separation to make maintenance and updates easier:

| Directory | Purpose | Rules |
|-----------|---------|-------|
| **@system** | Template code (synced from upstream) | **Do not modify.** Changes here will be overwritten when syncing template updates. |
| **@custom** | Product-specific code | **Your code goes here.** Safe from template sync overwrites. |

### Why This Matters

When a product like `zipchat-ai` or `supergrow` is built from this template:

1. **Forked at birth:** The product starts as a copy of product-template
2. **Diverges immediately:** Custom features go in `@custom` directories
3. **Stays in sync:** Template improvements (`@system`) can be pulled in later without conflicts

**Example:**

```
client/src/app/components/
├── @system/
│   ├── Header/        # Template header — do not edit
│   ├── Footer/        # Template footer — do not edit
│   └── ui/            # shadcn/ui components — safe to customize
└── @custom/
    ├── ChatWidget/    # Your product feature
    └── Dashboard/     # Your product feature
```

If we improve the template's `Header` component, products can pull that update without touching their custom `ChatWidget`.

---

## Quick Start

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **PostgreSQL 15+** (local or Docker)
- **npm 9+** (comes with Node)

### 1. Bootstrap

```bash
# Clone the template (or fork it for a new product)
git clone https://github.com/assimetria-ai/product-template.git my-product
cd my-product

# Install root dependencies (node-forge for key generation)
npm install

# Generate environment files and crypto keys
npm run bootstrap

# This creates:
# - server/.env (from server/.env.example)
# - client/.env (from client/.env.example)
# - JWT keypair (RS256, 2048-bit)
# - AES-256 encryption keys
```

### 2. Configure Environment

Edit **`server/.env`** and fill in required vars:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Stripe (get keys from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS SES (for emails)
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=...
AWS_SES_REGION=us-east-1
SES_FROM_EMAIL=hello@yourdomain.com

# JWT keys (auto-generated by bootstrap)
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...

# Encryption keys (auto-generated by bootstrap)
ENCRYPT_KEY=<64-char hex>
ENCRYPT_IV=<32-char hex>

# App config
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
```

Edit **`client/.env`** (usually only needs `VITE_API_URL`):

```bash
VITE_API_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies (in a new terminal)
cd ../client
npm install
```

### 4. Initialize Database

```bash
cd server

# Run migrations (creates tables)
npm run migrate

# Seed dev data (optional)
npm run seed
```

### 5. Run Dev Servers

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
# → API running on http://localhost:3000
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
# → App running on http://localhost:5173
```

**Terminal 3 — Stripe webhook listener (optional):**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret to server/.env
```

### 6. Open Browser

Navigate to **http://localhost:5173**

- Landing page loads → template is working
- Click "Sign In" → auth flow works
- Register a test account → database + email integration works

---

## API Patterns & Scaffolding

The template includes **production-ready patterns** for common API operations:

### 🔹 Pagination

Parse `?limit`, `?offset`, and `?page` automatically:

```javascript
const { pagination } = require('./lib/@system/Middleware')

router.get('/api/posts', pagination(), (req, res) => {
  // req.pagination = { limit: 20, offset: 0, page: 1 }
})
```

### 🔹 Search

Build SQL search conditions with filtering and sorting:

```javascript
const { parseSearchQuery, buildWhereClause } = require('./lib/@system/Helpers')

const search = parseSearchQuery(req.query, {
  defaultFields: ['title', 'content']
})

const { whereClause, params } = buildWhereClause({
  searchQuery: search.query,
  searchFields: search.fields,
  filters: { status: 'published' }
})
```

### 🔹 CRUD Helpers

Eliminate boilerplate with reusable handlers:

```javascript
const { handleList, handleGetById, handleCreate, handleUpdate, handleDelete } = require('./lib/@system/Helpers')

// List with pagination
router.get('/api/posts', pagination(), (req, res, next) => {
  handleList({ repo: postsRepo, req, res, next })
})

// Get by ID
router.get('/api/posts/:id', (req, res, next) => {
  handleGetById({ repo: postsRepo, req, res, next })
})
```

Or generate a complete CRUD router automatically:

```javascript
const { createCrudRouter } = require('./lib/@system/Helpers')

const postsRouter = createCrudRouter({
  repo: postsRepo,
  validation: { create: createSchema, update: updateSchema },
  middleware: { create: [authenticate], update: [authenticate] },
  config: { basePath: '/api/posts', dataKey: 'post' }
})

app.use(postsRouter)  // ✅ LIST, GET, CREATE, UPDATE, DELETE routes ready
```

📖 **Full guide:** [docs/API_PATTERNS.md](./docs/API_PATTERNS.md)  
📝 **Example:** [server/src/api/@custom/todos-example.js](./server/src/api/@custom/todos-example.js)

---

## Bootstrap Options

The bootstrap script is **safe by default** — it won't overwrite existing files unless you use `--force`.

```bash
# Safe bootstrap (skips existing files)
npm run bootstrap

# Force mode (overwrites everything)
npm run bootstrap:force

# Only regenerate crypto keys (skips env file copy)
npm run generate-keys
```

**What `bootstrap` does:**

1. ✅ Copies `server/.env.example` → `server/.env` (if `.env` doesn't exist)
2. ✅ Copies `client/.env.example` → `client/.env` (if `.env` doesn't exist)
3. ✅ Generates RSA 2048-bit keypair for JWT signing (RS256)
4. ✅ Generates AES-256 encryption key + IV for data-at-rest encryption
5. ✅ Injects keys into `server/.env`

**Safe for team use:** Developers can run `npm run bootstrap` without fear of overwriting their local config.

---

## Testing

### Unit & Integration Tests

```bash
cd server
npm test
```

### E2E Tests (Playwright)

```bash
# From project root

# Run headless (CI mode)
npm run test:e2e

# Run with browser UI (interactive)
npm run test:e2e:ui

# Run headed (visible browser)
npm run test:e2e:headed

# View last test report
npm run test:e2e:report
```

**E2E test suites (`e2e/@system/`):**

1. **01-public-pages.spec.ts** — Landing, pricing, terms, privacy, blog, help, about, contact
2. **02-auth.spec.ts** — Login, registration, password reset, email verification, guards
3. **03-navigation.spec.ts** — Client-side routing, redirects, 404 handling
4. **04-accessibility.spec.ts** — Titles, headings, alt text, ARIA labels

---

## Deployment

### Railway (Recommended)

The template includes Railway config out of the box.

**One-click deploy:**

1. Push to GitHub
2. Connect repo in Railway dashboard
3. Railway detects `railway.json` and auto-deploys
4. Add PostgreSQL plugin
5. Set environment variables (Stripe, SES, JWT keys)
6. Deploy completes → production URL ready

See **[docs/railway-deploy.md](./docs/railway-deploy.md)** for detailed steps.

### Docker

```bash
# Build
docker-compose build

# Run (includes PostgreSQL)
docker-compose up

# Production build
docker build -t my-product .
docker run -p 3000:3000 --env-file .env my-product
```

---

## How Products Use This Template

### Step 1: Fork for New Product

```bash
# Clone template
git clone https://github.com/assimetria-ai/product-template.git zipchat-ai
cd zipchat-ai

# Change remote
git remote rename origin template
git remote add origin https://github.com/assimetria-ai/zipchat-ai.git

# Bootstrap
npm run bootstrap
```

### Step 2: Customize Branding

Edit **`client/src/app/config/index.js`**:

```js
export const config = {
  productName: 'ZipChat AI',
  companyName: 'Assimetria',
  supportEmail: 'support@zipchat.ai',
  // ... more branding
}
```

Update **`client/index.html`**:

```html
<title>ZipChat AI — AI-Powered Customer Support</title>
<meta name="description" content="..." />
```

### Step 3: Add Custom Features

All product-specific code goes in `@custom` directories:

```
client/src/app/components/@custom/
├── ChatWidget/
│   ├── ChatWidget.jsx
│   ├── MessageList.jsx
│   └── InputBox.jsx
└── Analytics/
    └── AnalyticsDashboard.jsx
```

```
server/src/api/@custom/
├── chat/
│   ├── index.js
│   └── openai.js
└── analytics/
    └── index.js
```

### Step 4: Add Custom Routes

Edit **`client/src/app/routes/@custom/index.js`**:

```jsx
import { Route } from 'react-router-dom'
import { ChatPage } from '../../pages/app/@custom/ChatPage'
import { AnalyticsPage } from '../../pages/app/@custom/AnalyticsPage'

export const customRoutes = [
  <Route key="chat" path="/app/chat" element={<ChatPage />} />,
  <Route key="analytics" path="/app/analytics" element={<AnalyticsPage />} />
]
```

### Step 5: Ship

```bash
git add .
git commit -m "feat: initial ZipChat AI setup"
git push origin main
```

Railway auto-deploys. Done.

---

## Maintenance & Updates

### Pulling Template Updates

When the template improves (e.g., better auth, new Stripe features), products can pull those changes:

```bash
# Add template as remote (if not already done)
git remote add template https://github.com/assimetria-ai/product-template.git

# Fetch latest template
git fetch template

# Merge @system changes (avoid conflicts with @custom)
git merge template/main --allow-unrelated-histories

# Resolve conflicts (usually rare due to @system/@custom split)
# Then commit
git commit -m "chore: sync template updates"
```

**Conflict strategy:**

- `@system` changes: Accept template version
- `@custom` changes: Keep product version
- Shared files (package.json, etc.): Manual merge

---

## Security

### Authentication

- **JWT with RS256:** Asymmetric signing prevents token forgery
- **7-day expiry:** Balances UX and security
- **HTTP-only cookies:** Prevents XSS token theft
- **SameSite=Strict:** CSRF protection
- **Secure flag in production:** HTTPS-only transmission

### Data Encryption

- **AES-256-CBC:** Industry-standard symmetric encryption
- **Unique IV per record:** Prevents pattern analysis
- **Keys in env only:** Never committed to Git

### Rate Limiting

- **Auth endpoints:** 5 requests / 15 minutes per IP
- **API endpoints:** 100 requests / 15 minutes per IP
- **Prevents brute force attacks**

### Dependencies

- **Automated updates:** Dependabot checks weekly
- **Security audits:** `npm audit` in CI
- **Minimal dependencies:** Reduces attack surface

---

## Performance

### Frontend

- **Vite:** < 500ms dev server startup
- **Lazy routes:** Code-split per page (automatic with React Router lazy imports)
- **Optimized builds:** Tree-shaking, minification, CSS purging
- **shadcn/ui:** Only components you use are bundled (no bloat)

### Backend

- **Stateless auth:** No session store, horizontal scaling ready
- **Connection pooling:** pg-promise manages PostgreSQL connections efficiently
- **Prepared statements:** SQL injection prevention + performance

### Database

- **Indexes on foreign keys:** Fast joins
- **UUID primary keys:** Distributed-friendly
- **JSONB for flexible data:** Fast queries with GIN indexes

---

## FAQ

### Why not Next.js?

**Simplicity.** This template prioritizes:

- Clear client/server separation
- Minimal magic (explicit API calls, no "use server")
- Flexibility (swap Vite for Webpack, React for Vue)

Next.js is excellent but opinionated. This template is a scaffold, not a framework.

### Why shadcn/ui instead of Material UI / Chakra?

**Ownership.** shadcn/ui components are **copied into your project** — you own the code. No dependency, no breaking changes, full control. Built on Radix UI (accessible primitives) + Tailwind.

### Why PostgreSQL instead of MongoDB?

**Relational data.** Most SaaS apps have structured data (users, subscriptions, invoices). PostgreSQL handles this elegantly with ACID guarantees, JSON support (JSONB), and mature tooling.

### Why pg-promise instead of Prisma / TypeORM?

**Lightweight.** pg-promise is a thin wrapper around node-postgres. Full SQL control, prepared statements, and none of the ORM baggage. For complex queries, raw SQL is clearer than ORM DSLs.

### Can I replace Vite with Webpack?

**Yes.** The template includes `webpack.config.js` and `webpack.deps.json` for fallback. See [docs/webpack-setup.md](./docs/webpack-setup.md).

### Can I use TypeScript?

**Yes.** Vite supports `.tsx` out of the box. Just:

1. Rename `.jsx` → `.tsx`
2. Add type annotations
3. Vite handles the rest (no tsconfig needed for simple cases)

For stricter typing, add `tsconfig.json`.

### How do I add a new database table?

1. Create migration: `server/src/db/migrations/YYYYMMDD_my_table.sql`
2. Write schema: `CREATE TABLE...`
3. Run migration: `cd server && npm run migrate`
4. Add repo: `server/src/db/repos/@custom/my-table.js`

### How do I change the Stripe plan?

Edit `server/src/api/@system/billing/index.js` and update `PLANS` constant.

### How do I customize email templates?

Email templates are in `server/src/lib/@system/ses/templates/`. Modify HTML there.

---

## Roadmap

### ✅ Completed

- [x] React 18 + Vite frontend
- [x] Node.js + Express backend
- [x] PostgreSQL + pg-promise
- [x] JWT authentication (RS256)
- [x] Stripe subscription billing
- [x] AWS SES email integration
- [x] shadcn/ui component library
- [x] Tailwind CSS styling
- [x] React Router with protected routes
- [x] Playwright E2E tests
- [x] Railway deployment config
- [x] Docker containerization
- [x] Bootstrap scripts (env + keys)
- [x] Rate limiting on auth endpoints

### 🚧 In Progress

- [ ] Two-factor authentication (TOTP)
- [ ] OAuth providers (Google, GitHub)
- [ ] Background job queue (BullMQ)
- [ ] Improved onboarding flow
- [ ] Admin dashboard enhancements

### 📋 Planned

- [ ] GraphQL API option (Apollo Server)
- [ ] WebSocket support (Socket.io)
- [ ] S3 file uploads
- [ ] Full-text search (PostgreSQL FTS or Algolia)
- [ ] Audit logging
- [ ] Multi-tenancy support
- [ ] API versioning strategy

---

## Contributing

This is **internal Assimetria tooling**. Contributions from agents:

1. Create feature branch: `feat/my-improvement`
2. Make changes (prefer `@system` for reusable features)
3. Test locally (unit + E2E)
4. Open PR with clear description
5. Get review from 1+ agents
6. Merge to `main`

**Guidelines:**

- **Backward compatibility:** Don't break existing products
- **Documentation:** Update this README if adding features
- **Tests:** Add E2E tests for new flows
- **@system first:** If it's reusable, put it in `@system` (not `@custom`)

---

## License

**Internal use only.** Not open source. Assimetria proprietary.

---

## Support

**Questions?** Ask in #product-template channel (Discord / Slack).

**Bugs?** Report in GitHub Issues with steps to reproduce.

**Need help bootstrapping a new product?** Ping Frederico (docs), Carlos (MVP), or Jeremias (product strategy).

---

## Credits

Built by **Assimetria** for **Assimetria**.

- **Carlos** — Core architecture, backend patterns, MVP development
- **Frederico** — Documentation, deployment guides, QA strategy
- **Jeremias** — Product requirements, ICP alignment
- **Nora** — Marketing site templates, landing page optimization
- **Felix** — Git workflows, template sync automation

---

**Ready to build?** Run `npm run bootstrap` and start shipping. 🚀
