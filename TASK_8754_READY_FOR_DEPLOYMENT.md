# Task #8754 - Broadr Railway Health Check - READY FOR DEPLOYMENT

**Status**: ✅ CODE VERIFIED | ⏳ AWAITING DEPLOYMENT  
**Task ID**: #8754  
**Product**: Broadr Landing Page  
**Issue**: Railway health check failing in QA  
**Verified By**: Junior Agent (Latest iteration)  
**Date**: March 7, 2026, 02:10 UTC

---

## Executive Summary

The Broadr landing page health check code is **fully functional and tested**. The QA failure persists because the working code has **never been deployed to Railway** due to expired/invalid Railway access tokens.

### Local Verification ✅

```bash
# Build test
cd products/broadr/landing
npm run build
# ✅ Built successfully in 429ms

# Server test
PORT=3002 node server.js
# ✅ Server running on port 3002

# Health check test
curl http://localhost:3002/api/health
# ✅ {"status":"healthy","service":"broadr","timestamp":"2026-03-07T02:10:19.568Z"}
```

**All tests pass.** The health endpoint returns correct JSON with 200 status code.

---

## Why This Task Has Been Reassigned 60+ Times

1. Junior agents fix the code (already correct) ✅
2. Junior agents cannot deploy (Railway token invalid) ❌
3. QA continues seeing failures (old code still deployed) ❌
4. Task gets reassigned 🔁
5. **Loop continues indefinitely**

### Git Status
- ✅ Code changes committed multiple times (60+ commits for this task)
- ❌ No git remote configured in `products/broadr/landing`
- ❌ Code never pushed to repository
- ❌ Railway never triggered to redeploy

### Railway Access
```bash
$ railway whoami
# Invalid RAILWAY_TOKEN. Please check that it is valid...
```

Current `RAILWAY_TOKEN` in environment: `6d46d6a8-39bd-4931-8c11-37dd268572ab` (expired/invalid)

---

## What Needs to Happen

### Option 1: Deploy via Railway CLI (Recommended)

**Requirements**: 
- Valid Railway token with access to Broadr project
- Push access to Broadr git repository

**Steps**:
```bash
# 1. Set up Railway authentication
export RAILWAY_TOKEN=<valid-token>
railway login

# 2. Navigate to project
cd /Users/ruipedro/.openclaw/workspace-anton/products/broadr/landing

# 3. Link to Railway project
railway link
# Select: Broadr project

# 4. Deploy
railway up

# 5. Verify production health check
curl https://<broadr-production-url>/api/health
# Expected: {"status":"healthy","service":"broadr","timestamp":"..."}
```

### Option 2: Manual Git Push + Railway Auto-Deploy

**If Railway is configured for auto-deploy from git**:

```bash
# 1. Add git remote (if not exists)
cd /Users/ruipedro/.openclaw/workspace-anton/products/broadr/landing
git remote add origin <broadr-repository-url>

# 2. Push to main branch
git push origin main

# 3. Railway will auto-deploy on push
# Monitor: https://railway.app (Broadr project dashboard)

# 4. Verify after deployment
curl https://<broadr-production-url>/api/health
```

### Option 3: Railway Dashboard Manual Deploy

1. Go to https://railway.app
2. Select Broadr project
3. Go to Deployments tab
4. Click "Deploy" → "Redeploy"
5. Wait for build to complete
6. Verify health endpoint

---

## Technical Details

### Files Ready for Deployment

#### `railway.json`
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Key changes from previous failing version**:
- ✅ Builder changed from deprecated `NIXPACKS` to `RAILPACK`
- ✅ Schema URL updated to `railway.com`
- ✅ Proper health check path configured

#### `server.js` (Express)
- ✅ Health endpoint at `/api/health`
- ✅ Verifies `dist/` and `dist/index.html` exist before returning healthy
- ✅ Returns 503 if not built, 200 if ready
- ✅ Binds to `0.0.0.0` (Railway requirement)

#### `package.json`
- ✅ Node 18+ required
- ✅ Express dependency
- ✅ Build script: `vite build`
- ✅ Start script: `node server.js`

---

## Post-Deployment Checklist

After deployment completes:

- [ ] Verify production health check passes: `curl https://<url>/api/health`
- [ ] Check Railway deployment logs for errors
- [ ] Notify Duarte (QA) that deployment is complete
- [ ] Have Duarte retest and confirm health check passes
- [ ] **CLOSE TASK #8754 IN DATABASE** (critical to stop reassignment loop)

---

## Who Can Deploy This?

**People with access** (in order of preference):
1. Rui (workspace owner)
2. Duarte (QA, likely has Railway access)
3. Any Assimetria team member with Broadr Railway project permissions

**Required permissions**:
- Railway project access (Broadr)
- Valid Railway authentication token
- OR: Git push access to Broadr repository (if auto-deploy enabled)

---

## Emergency Escalation

If this task is reassigned **again** without deployment:

1. **STOP**: Do not fix the code again (it's already fixed)
2. **READ**: This file (`TASK_8754_READY_FOR_DEPLOYMENT.md`)
3. **ESCALATE**: Contact Rui or Duarte directly
4. **DOCUMENT**: Add entry to `TASK_8754_DUPLICATE_ASSIGNMENT_LOG.md`

**The code is not the problem. Deployment access is the problem.**

---

## Contact

**Task Reporter**: Duarte (QA)  
**Workspace Owner**: Rui  
**Current Status**: Code ready, awaiting deployment by authorized person

---

**Next Action Required**: Someone with Railway access must deploy this code to production.

**Estimated Time**: 5-10 minutes (once proper access is available)
