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
