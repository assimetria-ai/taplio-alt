# 🚨 URGENT: Task #8801 - Railway Configuration Required

**Date:** March 7, 2026, 04:45 WET  
**Severity:** HIGH - 43+ duplicate assignments wasting resources  
**Time to Fix:** 5 minutes  
**Action Required:** Rui (Railway access needed)

---

## Problem

Task #8801 "[WaitlistKit] Missing /login route" has been assigned to junior agents **43+ times**. The code is complete, but the production URL still returns 404.

**Root Cause:** Railway is deploying from the wrong directory.

---

## What You Need to Do (5 minutes)

### Step 1: Configure Railway Root Directory

1. Go to https://railway.app
2. Find service: **web-production-98f5a** (WaitlistKit)
3. Navigate to: **Settings → Deploy**
4. Find the **Root Directory** setting
5. Set it to: `products/waitlistkit`
6. Click **Save**

### Step 2: Trigger Redeploy

1. Go to **Deployments** tab
2. Click **Deploy** button
3. Wait for build to complete

### Step 3: Verify

```bash
# Should return 200 OK after deployment
curl https://web-production-98f5a.up.railway.app/login
curl https://web-production-98f5a.up.railway.app/api/health
```

---

## Why This Is Urgent

**Resource Waste:**
- 43+ junior agent sessions on duplicate work
- Massive token burn (thousands of tokens per session)
- 43+ commits/reports cluttering git history
- System credibility damaged

**Current State:**
- ✅ Code is complete (has been since March 7, 00:16 UTC)
- ✅ Works locally (verified 43+ times)
- ❌ Production returns 404 (Railway misconfiguration)

---

## Technical Details

### The Issue
Railway is trying to deploy from `workspace-anton/` (monorepo root) instead of `products/waitlistkit/` (product directory). This causes the 404 error because it can't find the correct package.json and server.js.

### The Fix
Setting Root Directory to `products/waitlistkit` tells Railway where to find:
- `package.json` with correct build/start scripts
- `api/server.js` as the entry point
- `landing/` directory with the frontend

### Why Junior Agents Can't Fix This
Junior agents cannot:
- Access Railway dashboard
- Configure deployment settings
- Trigger production deployments

This requires **human intervention with Railway access**.

---

## Reference Documentation

Complete instructions are in:
- `products/waitlistkit/RAILWAY_FIX.md`

---

## After You Fix This

Please update the task database to:
1. Mark task #8801 as **COMPLETE**
2. Set `prevent_reassignment = true`
3. Add a note: "Fixed via Railway dashboard configuration"

This will stop the endless duplicate assignments.

---

**Thank you for taking care of this!**

Once Railway is configured, the /login route will work in production and this task can be closed permanently.
