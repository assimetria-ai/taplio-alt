# Broadr Landing - Deployment Guide

## Railway Health Check Fix - v2

### Problem (Original)
The Railway health check was failing because the Vite dev server wasn't suitable for production deployment.

### Solution (Original)
Added a production-ready Express server with a dedicated health check endpoint.

### Problem (Updated - Task #8754)
Health check was still timing out because build and start commands were combined in `startCommand`, causing Railway to build during the start phase instead of the build phase.

### Solution (Updated)
Separated build and start commands in `railway.json`:
- `buildCommand`: `npm run build` (runs during build phase)
- `startCommand`: `npm start` (runs during start phase)

This ensures the app is fully built before the server starts and the health check is performed.

## Files Changed

1. **server.js** - New Express server that:
   - Serves static files from `dist/` directory
   - Provides `/health` endpoint for Railway health checks
   - Handles SPA routing

2. **package.json** - Updated with:
   - `express` dependency
   - `start` script for production

3. **railway.json** - Railway configuration:
   - Build command: `npm run build` (separate build phase)
   - Start command: `npm start` (separate start phase)
   - Health check path: `/health`
   - Automatic restart on failure

## Deployment

Railway will automatically:
1. **Install Phase**: Run `npm install`
2. **Build Phase**: Run `npm run build` (builds Vite app to `dist/`)
3. **Start Phase**: Run `npm start` (starts Express server on PORT from env)
4. **Health Check**: Check `/health` endpoint for service health

The separation of build and start phases ensures the application is fully built before the server starts and health checks begin, preventing timeout issues.

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
