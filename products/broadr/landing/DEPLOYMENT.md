# Broadr Landing - Deployment Guide

## Railway Health Check Fix

### Problem
The Railway health check was failing because the Vite dev server wasn't suitable for production deployment.

### Solution
Added a production-ready Express server with a dedicated health check endpoint.

## Files Changed

1. **server.js** - New Express server that:
   - Serves static files from `dist/` directory
   - Provides `/health` endpoint for Railway health checks
   - Handles SPA routing

2. **package.json** - Updated with:
   - `express` dependency
   - `start` script for production

3. **railway.json** - Railway configuration:
   - Build command: `npm run build && npm start`
   - Health check path: `/health`
   - Automatic restart on failure

## Deployment

Railway will automatically:
1. Run `npm install`
2. Run `npm run build` (builds Vite app to `dist/`)
3. Run `npm start` (starts Express server on PORT from env)
4. Check `/health` endpoint for service health

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
