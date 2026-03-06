# Broadr Landing - Deployment Guide

## Railway Health Check Fix - v2

### Problem (Original)
The Railway health check was failing because the Vite dev server wasn't suitable for production deployment.

### Solution (Original)
Added a production-ready Express server with a dedicated health check endpoint.

### Problem (Updated - Task #8754)
Health check was still timing out because build and start commands were combined in `startCommand`, causing Railway to build during the start phase instead of the build phase.

### Solution (Updated - Iteration 2)
Optimized Railway configuration in `railway.json`:
- Removed manual `installCommand` - Railway's Nixpacks auto-detects dependencies
- Combined install and build: `buildCommand`: `npm ci && npm run build`
- Direct start command: `startCommand`: `node server.js` (bypasses npm overhead)
- Reduced health check timeout from 300s to 100s (more reasonable for a static site server)

This ensures:
1. Clean dependency installation during build phase
2. App is fully built before starting
3. Server starts directly without npm wrapper overhead
4. Health check responds quickly once server is up

## Files Changed

1. **server.js** - New Express server that:
   - Serves static files from `dist/` directory
   - Provides `/health` endpoint for Railway health checks
   - Handles SPA routing

2. **package.json** - Updated with:
   - `express` dependency
   - `start` script for production

3. **railway.json** - Railway configuration:
   - Build command: `npm ci && npm run build` (install + build in build phase)
   - Start command: `node server.js` (direct server start)
   - Health check path: `/health` with 100s timeout
   - Automatic restart on failure

## Deployment

Railway will automatically:
1. **Build Phase**: Run `npm ci && npm run build` (installs deps + builds Vite app to `dist/`)
2. **Start Phase**: Run `node server.js` (starts Express server on PORT from env)
3. **Health Check**: Check `/health` endpoint (100s timeout) for service health

The optimized build command ensures all dependencies are installed and the app is fully built before the server starts. Using `node server.js` directly (instead of `npm start`) reduces startup overhead and improves health check reliability.

## Local Testing

```bash
# Build the app
npm run build

# Start production server
npm start

# Test health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2024-03-06T..."}
```

## Environment Variables

- `PORT` - Server port (defaults to 3000, Railway sets automatically)

## Health Check

- **Endpoint**: `/health`
- **Method**: GET
- **Response**: `200 OK` with JSON `{"status":"healthy","timestamp":"..."}`
