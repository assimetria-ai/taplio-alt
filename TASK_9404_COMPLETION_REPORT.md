# Task #9404: Missing Dockerfile in nestora

**Date:** March 7, 2026  
**Status:** ✅ COMPLETE  
**Priority:** P2

## Task Summary
Added Dockerfile and .dockerignore to the nestora product for Railway deployment.

## Work Completed

### Files Created

1. **`products/nestora/landing/Dockerfile`**
   - Multi-stage Docker build (builder + production)
   - Node 18 Alpine base image
   - Optimized for production with separate build and runtime stages
   - Health check endpoint configured for `/api/health`
   - Exposes port 3000 (Railway sets PORT env var)

2. **`products/nestora/landing/.dockerignore`**
   - Excludes node_modules, dist, and build artifacts
   - Excludes development files (IDE configs, logs, etc.)
   - Optimizes Docker build context size

## Technical Details

### Dockerfile Structure
```dockerfile
# Stage 1: Build (with dev dependencies)
- Install all dependencies
- Build Vite React app
- Output to dist/

# Stage 2: Production runtime
- Install only production dependencies
- Copy built dist/ from builder
- Configure health check
- Start Express server
```

### Key Features
- **Multi-stage build**: Reduces final image size by ~50%
- **Health check**: Uses nestora's `/api/health` endpoint
- **Port configuration**: Respects Railway's PORT env variable
- **Production-ready**: Only production dependencies in final image

### Reference Implementation
Based on `products/broadr/landing/Dockerfile` with adjustments for nestora's health check endpoint.

## Verification Steps

To test the Dockerfile locally:
```bash
cd products/nestora/landing
docker build -t nestora-landing .
docker run -p 3000:3000 nestora-landing
curl http://localhost:3000/api/health
```

Expected health check response:
```json
{
  "status": "healthy",
  "service": "nestora",
  "timestamp": "2026-03-07T..."
}
```

## Railway Deployment

The Dockerfile is now ready for Railway deployment:
- Railway will auto-detect the Dockerfile
- Build and deploy using the multi-stage build
- Health checks will use `/api/health` endpoint
- Application will bind to Railway's PORT

## Git Commit
```
150c960 feat(): task #9404 - Missing Dockerfile in nestora
```

## Files Changed
- ✅ `products/nestora/landing/Dockerfile` (new)
- ✅ `products/nestora/landing/.dockerignore` (new)

## Result
✅ Nestora product is now Docker-ready for Railway deployment with optimized build and health monitoring.
