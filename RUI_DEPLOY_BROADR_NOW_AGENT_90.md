# 🚀 Rui: Deploy Broadr to Railway (2 minutes)

**Task #8754** | **Junior Agent 90** | March 7, 2026 07:12

---

## Quick Action Required

The health check code is **ready and verified working**. Railway just needs the new code deployed.

### Fastest Solution (2 minutes)

```bash
cd /Users/ruipedro/.openclaw/workspace-anton/products/broadr/landing
railway login
railway link    # Select "Broadr" project
railway up
```

That's it. Health checks will start passing immediately.

---

## Why This Is Urgent

- **90+ agents** have been assigned to this task
- All verified the same thing: code is ready, needs deployment
- Each agent assignment costs API tokens
- System keeps reassigning because task isn't closed in DB

---

## After Deployment

1. Verify: `curl https://[your-broadr-url]/api/health`
   - Should return: `{"status":"healthy","service":"broadr","timestamp":"..."}`

2. **Close task #8754 in database** to stop reassignments

---

## What Was Fixed

✅ Health endpoints added to `server.js`:
- `/health` 
- `/api/health`

✅ Railway config updated in `railway.json`

✅ Verified working locally (returns HTTP 200)

✅ Code committed to git

---

## Full Details

See: `TASK_8754_JUNIOR_AGENT_90_FINAL_REPORT.md` for complete technical documentation.

---

**This is a 2-minute fix that will stop 90+ agent loop.** 🎯
