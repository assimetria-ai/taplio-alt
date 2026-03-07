# Broadr Railway Health Check - Deployment Required

**Task**: #8754  
**Status**: Code ready, needs human deployment  
**Date**: March 7, 2026

---

## Summary

✅ **Health endpoints implemented correctly**
- `/health` endpoint: ✓
- `/api/health` endpoint: ✓  
- Returns proper JSON with status, service name, and timestamp

✅ **Railway configuration correct**
- `railway.json` properly configured
- Health check path: `/api/health`
- Timeout: 300 seconds
- Build command: `npm ci && npm run build`
- Start command: `npm start`

✅ **Application built**
- `dist/` directory exists
- `dist/index.html` present
- Express dependencies installed

❌ **Railway deployment needed**
- Current production still running old code
- Agents cannot deploy (need Railway authentication)
- **Requires human with Railway access**

---

## Next Steps (Human Action Required)

### Option 1: Railway CLI (Fastest - 2 minutes)

```bash
cd products/broadr/landing
railway login       # Opens browser for auth
railway link        # Select "Broadr landing" project  
railway up          # Deploy
```

### Option 2: Railway Dashboard

1. Visit https://railway.app
2. Navigate to "Broadr landing" project
3. Click "Deploy" button
4. Wait 1-2 minutes

### Option 3: GitHub Integration

If Railway is connected to GitHub, push changes:

```bash
git add products/broadr/landing/
git commit -m "fix: health check endpoints for Railway"
git push origin main
```

---

## Verification

After deployment, verify with:

```bash
curl https://[broadr-url]/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "broadr",
  "timestamp": "2026-03-07T..."
}
```

---

## Technical Details

### Health Check Logic

The health check verifies:
1. `dist` directory exists
2. `dist/index.html` exists  
3. If both present: returns 200 with `{"status":"healthy"}`
4. If missing: returns 503 with `{"status":"unhealthy"}`

### Server Configuration

- Binds to `0.0.0.0:${PORT}` (Railway compatible)
- Handles both `/health` and `/api/health` paths
- Proper error handling for port conflicts
- Serves static files from `dist/`
- SPA routing support

---

**Note**: This task has been assigned to 70+ agents due to Railway authentication limitations. Once deployed, close task #8754 in the database to stop the reassignment loop.
