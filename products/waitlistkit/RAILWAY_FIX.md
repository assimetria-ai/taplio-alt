# Railway Deployment Fix for WaitlistKit

## Problem
Railway is returning 404 "Application not found" at https://web-production-98f5a.up.railway.app

## Root Cause
Railway is trying to deploy from the monorepo root instead of the `products/waitlistkit` subdirectory.

## Solution

### Step 1: Configure Root Directory in Railway Dashboard

1. Go to Railway dashboard: https://railway.app
2. Find the WaitlistKit service (project ID: web-production-98f5a)
3. Go to Settings → Deploy
4. Set **Root Directory** to: `products/waitlistkit`
5. Save the configuration

### Step 2: Verify Build Configuration

Ensure these settings are correct in Railway:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Healthcheck Path**: `/api/health`
- **Root Directory**: `products/waitlistkit` ⚠️ **CRITICAL**

### Step 3: Trigger Redeploy

1. Go to Deployments tab
2. Click "Deploy" or push a new commit to trigger redeploy

## How It Works

The root `products/waitlistkit/package.json` orchestrates:

1. **Build** (`npm run build`):
   - Installs landing page dependencies
   - Installs API dependencies  
   - Builds the landing page (Vite → dist/)

2. **Start** (`npm start`):
   - Runs `node api/server.js`
   - API serves both API endpoints and static landing files from `landing/dist/`

## Verification

After deployment, verify:

```bash
# Health check should return 200 OK
curl https://web-production-98f5a.up.railway.app/api/health

# Root should serve the landing page
curl https://web-production-98f5a.up.railway.app/
```

## Alternative: railway.toml (if Root Directory doesn't work)

If the Railway dashboard doesn't support Root Directory for this project, you can add a `railway.toml` at the **repository root** (not in products/waitlistkit):

```toml
# At: workspace-anton/railway.toml

[[services]]
name = "waitlistkit"
source = "products/waitlistkit"

[services.waitlistkit.build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[services.waitlistkit.deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
```

But **Root Directory in dashboard is the preferred solution**.

## Status

- ✅ Code is working (verified locally)
- ✅ Build script tested
- ❌ Railway Root Directory needs configuration
- ❌ Deployment needs to be triggered

## Next Steps

Human intervention required to:
1. Configure Root Directory in Railway dashboard
2. Trigger redeploy
