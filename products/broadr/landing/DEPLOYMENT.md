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

### Problem (Final Fix - Task #8754)
Health check was failing with QA because the 100-second timeout was still too long. Railway health checks expect quick responses (typically 10-30 seconds).

### Solution (Final - Iteration 3)
1. **Reduced timeout**: `healthcheckTimeout` from 100s to 30s
   - The Express server starts in under 1 second locally
   - 30 seconds provides sufficient buffer for Railway's cold start
   - Aligns with Railway best practices for static site deployments

2. **Enhanced health check endpoint** with readiness verification:
   - Checks that `dist/` folder exists
   - Verifies `dist/index.html` is present
   - Returns `503 Service Unavailable` if app isn't built
   - Returns `200 OK` only when fully ready to serve content
   - This prevents Railway from marking the service as healthy before it can actually serve traffic

3. **Improved error handling**:
   - Added server error handling for port conflicts
   - Better logging for debugging Railway deployments
   - Explicit binding confirmation to 0.0.0.0

This ensures:
1. Clean dependency installation during build phase
2. App is fully built before starting
3. Server starts directly without npm wrapper overhead
4. Health check responds quickly once server is up

## Files Changed

1. **server.js** - Production Express server that:
   - Serves static files from `dist/` directory
   - Provides `/health` endpoint with readiness verification (checks dist/ exists)
   - Returns 503 if app not built, 200 if ready to serve
   - Handles SPA routing
   - Binds to 0.0.0.0 for Railway compatibility
   - Includes error handling for port conflicts

2. **package.json** - Updated with:
   - `express` dependency
   - `start` script for production

3. **railway.json** - Railway configuration:
   - Build command: `npm ci && npm run build` (install + build in build phase)
   - Start command: `node server.js` (direct server start)
   - Health check path: `/health` with 30s timeout
   - Automatic restart on failure

## Deployment

Railway will automatically:
1. **Build Phase**: Run `npm ci && npm run build` (installs deps + builds Vite app to `dist/`)
2. **Start Phase**: Run `node server.js` (starts Express server on PORT from env)
3. **Health Check**: Check `/health` endpoint (30s timeout) for service health

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
