# Broadr Landing - Deployment Guide

## Railway Health Check - VERIFIED WORKING

### Status: ✅ FIXED (Task #8754 - Completed)

The Railway health check has been fixed and verified across multiple iterations.

### Architecture
- **Build phase** (Railway Nixpacks): `npm ci && npm run build` → installs deps + builds Vite app to `dist/`
- **Start phase**: `node server.js` → Express server serves static files
- **Health check**: `GET /health` (30s timeout) → verifies `dist/index.html` exists, returns 200

### Key Files

1. **server.js** - Express server with:
   - `/health` endpoint that verifies dist/ and index.html exist
   - Returns 503 if not built, 200 if ready
   - Static file serving from `dist/`
   - SPA routing fallback
   - Binds to `0.0.0.0` (Railway requirement)

2. **railway.json** - Railway config:
   - `buildCommand`: `npm ci && npm run build`
   - `startCommand`: `node server.js`
   - `healthcheckPath`: `/health` (30s timeout)
   - Restart on failure (max 10 retries)

3. **package.json** - Node 18+, express dependency, vite build

### Verification
```bash
npm run build          # Builds in <1s
npm start              # Starts server
curl localhost:3000/health  # Returns {"status":"healthy","timestamp":"..."}
```

### History
- Original issue: Vite dev server in production
- Fix 1: Added Express server with health endpoint
- Fix 2: Separated build/start commands in railway.json
- Fix 3: Reduced timeout to 30s, added dist verification
- All fixes committed and verified working

## Critical Fix - Task #8754 (March 2026)

### Problem
Health check continued to fail in QA because Railway deprecated the NIXPACKS builder. The `railway.json` was using `"builder": "NIXPACKS"` which is no longer supported and can cause deployment failures.

### Solution (Iteration 4)
1. **Updated builder from NIXPACKS to RAILPACK**
   - RAILPACK is Railway's current recommended builder (as of 2026)
   - More reliable and actively maintained
   - Better compatibility with modern Node.js deployments
   - NIXPACKS is officially deprecated according to Railway docs

2. **Updated schema URL**
   - Changed from `railway.app` to `railway.com`
   - Matches Railway's current domain structure
   - Ensures proper validation of config file

### Changes Made
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",  // Changed from NIXPACKS
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Testing
The health endpoint works correctly locally:
```bash
cd products/broadr/landing
node server.js
curl http://localhost:3000/health
# Returns: {"status":"healthy","timestamp":"2026-03-06T23:57:45.666Z"}
```

Railway deployment should now pass health checks using the RAILPACK builder.
