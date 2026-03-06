# Task #8754 - Broadr Railway Health Check Fix

## Issue Identified

The Railway health check for the Broadr landing page was failing due to a **configuration mismatch** between the documented fix and the actual `railway.json` file.

## Root Cause

The `railway.json` configuration was missing a critical part of the documented solution:

**Current (broken) config:**
```json
{
  "build": {
    "buildCommand": "npm run build"
  },
  "deploy": {
    "healthcheckTimeout": 300
  }
}
```

**Should have been (per DEPLOYMENT.md):**
```json
{
  "build": {
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "healthcheckTimeout": 100
  }
}
```

### Problems with the old config:

1. **Missing `npm ci`**: Dependencies were not being installed during the build phase, which could cause the server to fail to start if dependencies weren't available
2. **Excessive timeout**: 300s timeout was unnecessarily long (should be 100s for a static site server)

## Solution Applied

Updated `products/broadr/landing/railway.json` to:
- Add `npm ci &&` to the build command to ensure clean dependency installation during build phase
- Reduce health check timeout from 300s to 100s as documented

This ensures:
1. Dependencies are installed cleanly during build phase
2. App is fully built before the server starts
3. Server starts directly with all dependencies available
4. Health check has a reasonable timeout that matches the deployment docs

## Files Changed

- `products/broadr/landing/railway.json` - Updated build command and health check timeout

## Commit

```
feat(): task #8754 - [broadr] Railway health check failing
```

Commit hash: `1c78217`

## Testing Recommendation

The fix should be deployed to Railway and the health check should now pass within 100 seconds. The health endpoint at `/health` will respond with:

```json
{"status":"healthy","timestamp":"2024-03-06T..."}
```

## Status

✅ **COMPLETE** - Configuration fixed and committed to git
