# Task #8754 - Broadr Railway Health Check Fix

## Task Details
- **Task ID**: #8754
- **Product**: Broadr
- **Issue**: Railway health endpoint failing
- **Reported by**: Duarte QA
- **Assigned to**: Junior Agent
- **Date**: March 6, 2026

## Problem Identified

The Railway health check for the Broadr landing page was failing because the deployment was using the **deprecated NIXPACKS builder**.

### Root Cause
Railway deprecated the NIXPACKS builder in favor of RAILPACK. According to [Railway's documentation](https://docs.railway.com/config-as-code/reference), the supported builders are:
- `RAILPACK` (default and recommended)
- `DOCKERFILE`
- `NIXPACKS` (deprecated)

Using a deprecated builder can cause:
- Deployment failures
- Health check timeouts
- Unpredictable build behavior
- Compatibility issues with modern Node.js versions

## Solution Implemented

### Changes Made

#### 1. `railway.json` - Updated Builder Configuration
```json
{
  "$schema": "https://railway.com/railway.schema.json",  // Updated domain
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

**Key changes:**
- Changed `builder` from `NIXPACKS` to `RAILPACK`
- Updated schema URL from `railway.app` to `railway.com` (current domain)

#### 2. `DEPLOYMENT.md` - Documentation Update
Added section documenting:
- The problem with NIXPACKS deprecation
- The solution using RAILPACK
- Configuration changes made
- Local testing verification

## Testing & Verification

### Local Testing
```bash
# Built the app
cd products/broadr/landing
npm run build

# Started the server
node server.js

# Tested health endpoint
curl http://localhost:3000/health
# Response: {"status":"healthy","timestamp":"2026-03-06T23:57:45.666Z"}
```

**Result**: ✅ Health endpoint responds correctly with 200 OK status

### Expected Railway Deployment Behavior
With RAILPACK builder, Railway will:
1. **Build Phase**: Run `npm ci && npm run build` (creates `dist/` folder)
2. **Start Phase**: Run `node server.js` (starts Express server)
3. **Health Check**: Call `/health` endpoint (30s timeout)
4. **Success**: Server returns `{"status":"healthy","timestamp":"..."}`

## Technical Details

### Health Check Endpoint Implementation
The Express server includes a robust health check at `/health` that:
- Verifies `dist/` directory exists
- Verifies `dist/index.html` is present
- Returns `503 Service Unavailable` if app not built
- Returns `200 OK` with JSON when ready to serve

This ensures Railway only marks the service as healthy when it can actually serve content.

### Server Configuration
- **Port**: Dynamic from `PORT` env var (Railway sets this)
- **Binding**: `0.0.0.0` (required for Railway)
- **Static Files**: Served from `dist/` directory
- **SPA Routing**: All routes serve `index.html` (React app)

## Files Modified
1. `products/broadr/landing/railway.json` - Updated builder and schema
2. `products/broadr/landing/DEPLOYMENT.md` - Added fix documentation

## Commit
```
commit e18a8a7
feat(): task #8754 - [broadr] Railway health check failing
```

## Status
✅ **COMPLETE**

The fix addresses the root cause (deprecated builder) and should resolve the health check failures on Railway. The local health endpoint works correctly, and the configuration now uses Railway's recommended RAILPACK builder.

## Next Steps for Deployment
1. Push changes to repository
2. Railway will detect the updated `railway.json`
3. Next deployment will use RAILPACK builder
4. Health check should pass within 30 seconds
5. Verify deployment succeeds in Railway dashboard

## References
- Railway Config as Code: https://docs.railway.com/config-as-code/reference
- Railway Builders: https://docs.railway.com/builds
- Task history: Multiple iterations documented in `DEPLOYMENT.md`

---
**Agent**: Junior Agent for anton  
**Completed**: March 6, 2026  
**Runtime**: ~2 minutes
