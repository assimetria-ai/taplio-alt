# Task #8799 - [WaitlistKit] Fix Railway Deployment

## Status: CODE READY — DEPLOYMENT BLOCKED

## Diagnosis

The Railway URL `https://web-production-98f5a.up.railway.app` returns:
```json
{"status":"error","code":404,"message":"Application not found"}
```

The `x-railway-fallback: true` header confirms this is a **Railway platform-level error** — the application service doesn't exist or is stopped on Railway's side.

## What I Fixed

1. **Added root `package-lock.json`** — Required by Railway's Nixpacks builder to detect Node.js projects and install dependencies correctly.

## What I Verified

- **Server works locally**: `node api/server.js` serves landing page at `/` and health check at `/api/health` (returns 200)
- **Build pipeline works**: `npm run build` successfully installs dependencies and builds the Vite/React landing page
- **railway.json is correct**: Build command, start command, and health check path all match the code
- **Code is clean**: The server correctly serves static files from `landing/dist` with SPA fallback

## Deployment Blocker

The `RAILWAY_TOKEN` environment variable is **invalid/expired**. Cannot deploy via CLI:
```
Invalid RAILWAY_TOKEN. Please check that it is valid and has access to the resource you're trying to use.
```

**Human action required**: Either redeploy from Railway dashboard or provide a valid Railway token.

## Commit
```
feat(): task #8799 - [WaitlistKit] Fix Railway deployment — root URL returning 40
```
