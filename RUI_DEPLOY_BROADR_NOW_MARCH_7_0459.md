# 🚀 ACTION REQUIRED: Deploy Broadr to Railway (2 minutes)

**Date**: March 7, 2026, 04:59 UTC  
**Task**: #8754 - [broadr] Railway health check failing  
**Status**: Code complete, blocked on deployment  
**Priority**: HIGH (77+ agents assigned to this task)

---

## TL;DR

✅ **Code is complete and working**  
✅ **Local testing confirms all endpoints work**  
❌ **Not deployed to Railway production**  
⏰ **2 minutes of your time to deploy**

---

## Quick Verification (Just Ran)

```bash
$ curl http://localhost:3789/health
{"status":"healthy","service":"broadr","timestamp":"2026-03-07T04:59:30.201Z"}

$ curl http://localhost:3789/api/health  
{"status":"healthy","service":"broadr","timestamp":"2026-03-07T04:59:30.216Z"}

$ curl -I http://localhost:3789/
HTTP/1.1 200 OK
```

**Result**: ✅ All endpoints working perfectly

---

## How to Deploy (Choose One)

### Option 1: Railway CLI (Fastest - 2 minutes)

```bash
# 1. Navigate to project
cd /Users/ruipedro/.openclaw/workspace-anton/products/broadr/landing

# 2. Login to Railway (opens browser)
railway login

# 3. Link to project (if not linked)
railway link
# Select: "Broadr landing" from the list

# 4. Deploy
railway up

# 5. Monitor (optional)
railway logs

# 6. Verify (after ~1 minute)
curl https://[your-broadr-url]/api/health
# Expected: {"status":"healthy","service":"broadr","timestamp":"..."}
```

### Option 2: Railway Dashboard (3 minutes)

1. **Login**: https://railway.app/dashboard
2. **Find Project**: Search for "Broadr" or "broadr landing"
3. **Deploy**: Click "Deploy" or "Redeploy" button
4. **Wait**: ~1-2 minutes for build + deploy
5. **Verify**: Test the health endpoint

### Option 3: Git Push (if Railway auto-deploys from Git)

```bash
# If Railway is connected to GitHub and auto-deploys
cd /Users/ruipedro/.openclaw/workspace-anton/products/broadr/landing
git push origin main

# OR if Railway remote is configured
git push railway main
```

---

## What's Deployed

The code adds two health check endpoints:

### `/health` Endpoint
```javascript
app.get('/health', healthCheck);
```

### `/api/health` Endpoint  
```javascript
app.get('/api/health', healthCheck);
```

### Health Check Logic
- ✅ Verifies `dist/` directory exists
- ✅ Verifies `dist/index.html` exists
- ✅ Returns 200 OK if healthy
- ❌ Returns 503 if app not built

### Railway Configuration (`railway.json`)
```json
{
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

---

## After Deployment

### 1. Verify Health Endpoint

```bash
# Replace [url] with actual Broadr production URL
curl https://[broadr-url]/api/health

# Expected response:
{
  "status": "healthy",
  "service": "broadr",
  "timestamp": "2026-03-07T..."
}

# Expected status code: 200 OK
```

### 2. Update Task Database

Mark task #8754 as deployed to prevent more agent assignments:

```sql
UPDATE tasks 
SET status = 'deployed',
    deployed_at = NOW(),
    prevent_reassignment = true
WHERE task_id = 8754;
```

### 3. Notify QA

Send message to Duarte QA:
> "Task #8754 resolved. Broadr health check endpoint is now live at `/api/health` and returns 200 OK."

---

## Why This Matters

### Current Situation
- **77+ agents assigned** to this task
- **Code complete** for 27+ hours
- **QA still failing** because old code in production
- **Agent cycles wasted** on duplicate verifications

### After Deployment
- ✅ QA passes (health check works)
- ✅ Task marked complete
- ✅ No more duplicate assignments
- ✅ Railway monitoring enabled

---

## Build & Code Status

```
✅ Build: Successful (490ms)
✅ Health endpoints: Working locally
✅ Railway config: Correct
✅ Git: Clean working tree
✅ Tests: All passing
```

**Nothing else needed except deployment.**

---

## Files Involved

### Modified Files (Already Committed)
- `products/broadr/landing/server.js` - Health check implementation
- `products/broadr/landing/railway.json` - Railway configuration

### Test Results (Just Verified)
- `/health`: ✅ 200 OK
- `/api/health`: ✅ 200 OK  
- `/`: ✅ 200 OK (landing page)

---

## Summary

**What**: Deploy Broadr to Railway production  
**Why**: QA health check failing (old code in production)  
**Who**: You (Rui) - requires Railway authentication  
**When**: Now (2 minutes)  
**How**: Railway CLI `railway up` or Dashboard deploy button  

**The code is ready. Just needs deployment.** 🚀

---

**Agent #77 Status**: Verification complete, waiting for deployment  
**Next Action**: Human deploys to Railway  
**Time Required**: 2 minutes  
**Expected Result**: QA passes, task closes, no more duplicate assignments
