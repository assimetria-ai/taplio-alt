# Task #8799 - WaitlistKit Railway Deployment Guide

## Status: FIX COMPLETE - AWAITING DEPLOYMENT

### Problem
Railway deployment at `https://web-production-98f5a.up.railway.app` returns:
```json
{"status":"error","code":404,"message":"Application not found","request_id":"..."}
```

This is a Railway infrastructure error meaning the application isn't deployed or the URL isn't connected to a deployment.

### Root Cause
The code fix for serving the landing page was completed in previous commits (945d856, 57d35b5, etc.), but the changes were never pushed to trigger Railway's auto-deployment from Git.

### Current Code Status ✅
- ✅ `package.json` has correct start command: `"start": "node api/server.js"`
- ✅ `api/server.js` serves static files from `../landing/dist/`
- ✅ SPA fallback routing implemented
- ✅ API endpoints (`/api/health`) functional
- ✅ Landing page built in `landing/dist/`
- ✅ Tested locally - all endpoints working

### What's Needed: Git Remote & Push

Railway auto-deploys from Git commits. The deployment is blocked because:
1. **No git remote configured** in this repository
2. **Changes not pushed** to Railway's connected Git repository

### Deployment Options

#### Option 1: Configure Git Remote & Push (Recommended)
```bash
cd /Users/ruipedro/.openclaw/workspace-anton

# Add the Railway-connected Git remote
git remote add origin <YOUR_RAILWAY_GIT_REPO_URL>

# Push to trigger deployment
git push origin main
```

#### Option 2: Railway CLI
```bash
cd /Users/ruipedro/.openclaw/workspace-anton/products/waitlistkit

# Login to Railway
railway login

# Link to project (if not linked)
railway link

# Deploy
railway up
```

#### Option 3: Manual Railway Dashboard
1. Go to Railway dashboard
2. Find the WaitlistKit project
3. Trigger manual deployment
4. Or reconnect GitHub repository

### After Deployment - Verification
Once deployed, verify:
```bash
# Root URL should serve landing page (not 404)
curl https://web-production-98f5a.up.railway.app/

# Health check
curl https://web-production-98f5a.up.railway.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Technical Details
**Repository**: `/Users/ruipedro/.openclaw/workspace-anton`  
**Product Path**: `products/waitlistkit/`  
**Latest Commit**: 192b3b2  
**Railway URL**: `https://web-production-98f5a.up.railway.app`  
**Railway Config**: `products/waitlistkit/railway.json`  

**Build Command**: `npm run build` (installs deps + builds landing)  
**Start Command**: `npm start` → `node api/server.js`  
**Health Check**: `/api/health`  

---
**Task**: #8799  
**Status**: Code complete, deployment blocked  
**Action Required**: Push to Git or use Railway CLI to deploy  
**Date**: 2026-03-07 03:32 UTC
