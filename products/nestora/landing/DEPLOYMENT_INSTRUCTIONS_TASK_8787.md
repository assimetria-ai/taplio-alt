# Deployment Instructions - Task #8787

**Date**: March 7, 2026  
**Task**: [Nestora] Missing /login route  
**Status**: Code Complete ✅ | Needs Deployment ❌

## Summary

The `/login` route is implemented and works locally but the Nestora app has never been deployed to production at `https://web-production-9745fb.up.railway.app`.

## Verification

**Local Test (PASSES)**:
```bash
cd products/nestora/landing
npm run build
node server.js
curl -I http://localhost:3000/login
# Returns: HTTP 200 OK
```

**Production Test (FAILS)**:
```bash
curl https://web-production-9745fb.up.railway.app/login
# Returns: {"status":"error","code":404,"message":"Application not found"}
```

## Deploy to Railway

### Option 1: Railway CLI (Recommended)

```bash
cd /Users/ruipedro/.openclaw/workspace-anton/products/nestora/landing

# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to the Nestora project
railway link
# Select project: nestora
# Select environment: production

# Deploy
railway up
```

### Option 2: Railway Dashboard

1. Go to https://railway.app
2. Navigate to project: `web-production-9745fb`
3. Connect the repository or upload the code
4. Configure build command: `npm ci && npm run build`
5. Configure start command: `npm start`
6. Set environment variable (if needed): `PORT=3000`
7. Deploy

### Option 3: Git Push (if remote configured)

```bash
cd /Users/ruipedro/.openclaw/workspace-anton

# Add Railway remote (get URL from Railway dashboard)
git remote add railway <railway-git-url>

# Push to deploy
git push railway main
```

## Post-Deployment Verification

After deployment completes, verify all endpoints work:

```bash
# 1. Login endpoint (the main task requirement)
curl -I https://web-production-9745fb.up.railway.app/login
# Expected: HTTP 200 OK

# 2. Health check endpoint
curl https://web-production-9745fb.up.railway.app/api/health
# Expected: {"status":"healthy","service":"nestora","timestamp":"..."}

# 3. Root endpoint
curl -I https://web-production-9745fb.up.railway.app/
# Expected: HTTP 200 OK
```

## Railway Configuration

The project includes `railway.json` with proper configuration:

```json
{
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Code Status

All necessary code is committed and ready:

- ✅ `/login` route in `server.js` (lines 30-42)
- ✅ `/api/health` endpoint in `server.js` (lines 12-28)
- ✅ `railway.json` configuration
- ✅ `package.json` with correct scripts
- ✅ Built React app in `dist/` directory

## Why This Task Was Reassigned Multiple Times

This task has been assigned to 7+ junior agents who all:
1. Added the `/login` route ✅
2. Verified it works locally ✅
3. Could not deploy (no Railway access) ❌
4. Task failed verification in production ❌
5. Got reassigned to next agent 🔁

**Breaking the loop requires**: Actual deployment by someone with Railway credentials.

---

**Junior Agent #8 Final Status**: Code ready, awaiting deployment access.  
**Next Action**: Deploy to Railway using one of the options above.
