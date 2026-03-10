# CSRF Protection Implementation Guide
**Task #10361 & #10362 - CSRF Defense**

## Overview

CSRF (Cross-Site Request Forgery) protection has been implemented in the product template using the `csurf` middleware package with `SameSite=Lax` cookie attributes.

## Implementation Summary

### ✅ What Was Implemented

#### Task #10361: CSRF Middleware
- **CSRF token middleware** (`csrf.js`)
  - Synchronizer token pattern using cookies
  - Token validation on state-changing requests (POST, PUT, PATCH, DELETE)
  - Multiple token delivery methods (header, body, query string)
  - Error handling with user-friendly messages
  - Security logging for CSRF violations

#### Task #10362: SameSite Cookie Attribute
- **Session cookies** updated to `SameSite=Lax`:
  - Access tokens
  - Refresh tokens
  - OAuth tokens
  - CSRF tokens

## How CSRF Protection Works

### Token Generation
1. Server generates CSRF token and stores it in cookie: `_csrf`
2. Cookie is `httpOnly` (JavaScript cannot read it)
3. Cookie has `sameSite: 'lax'` (sent on top-level navigation)

### Token Validation
Client must include token in requests via:
- **Header** (recommended): `X-CSRF-Token` or `CSRF-Token`
- **Body**: `_csrf` field
- **Query string**: `?_csrf=token` (fallback)

### Safe Methods
GET, HEAD, OPTIONS requests bypass CSRF protection (read-only operations).

## Usage

### Backend Setup

CSRF middleware is automatically applied in `app.js`:

```javascript
// CSRF Protection (after cookieParser)
app.use(csrfProtection)

// CSRF token endpoint
app.get('/api/csrf-token', getCsrfToken)

// CSRF error handler
app.use(csrfErrorHandler)
```

### Frontend Integration

#### 1. Get CSRF Token on App Load

```javascript
// Fetch token when app initializes
async function initCsrfToken() {
  const response = await fetch('/api/csrf-token', {
    credentials: 'include' // Important: include cookies
  })
  const { csrfToken } = await response.json()
  
  // Store token for later use
  sessionStorage.setItem('csrfToken', csrfToken)
  return csrfToken
}
```

#### 2. Include Token in State-Changing Requests

**Option A: Custom Header (Recommended)**
```javascript
const csrfToken = sessionStorage.getItem('csrfToken')

fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify({ title: 'Hello' })
})
```

**Option B: Request Body**
```javascript
fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    _csrf: csrfToken,
    title: 'Hello'
  })
})
```

**Option C: Form Submission**
```html
<form method="POST" action="/api/posts">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}">
  <input type="text" name="title">
  <button type="submit">Submit</button>
</form>
```

#### 3. React/Vue Example

```javascript
// Create axios instance with CSRF token
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// Add CSRF token to all requests
api.interceptors.request.use(config => {
  const csrfToken = sessionStorage.getItem('csrfToken')
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

// Handle CSRF errors (token expired, refresh)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 403 && 
        error.response?.data?.error === 'invalid_csrf_token') {
      // Refresh CSRF token and retry
      await initCsrfToken()
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

## SameSite=Lax vs Strict

### Why Lax?

**SameSite=Lax** provides:
- ✅ CSRF protection for POST/PUT/PATCH/DELETE
- ✅ Allows cookies on top-level navigation (clicking links)
- ✅ Better user experience
- ✅ Works with email links, bookmarks, etc.

**SameSite=Strict** would:
- ❌ Block cookies even on legitimate navigation
- ❌ Force re-authentication after clicking email links
- ❌ Break legitimate cross-site workflows

### When to Use Each

| Use Case | SameSite Setting |
|----------|------------------|
| Session cookies | `lax` (recommended) |
| CSRF tokens | `lax` |
| Highly sensitive operations | `strict` (with usability trade-off) |
| Embedded widgets | `none` (requires HTTPS) |

## Security Features

### Defense in Depth

1. **CSRF Tokens** - Primary defense
2. **SameSite Cookies** - Browser-level protection
3. **CORS Headers** - Restrict cross-origin requests
4. **Origin Validation** - Check request origin
5. **Custom Headers** - Require non-simple requests

### Protection Against

- ✅ Cross-site form submissions
- ✅ AJAX requests from malicious sites
- ✅ Image/script tags as attack vectors
- ✅ Clickjacking (via X-Frame-Options)
- ✅ Token reuse attacks
- ✅ Session fixation

### What's NOT Protected

- ❌ XSS attacks (use CSP + input validation)
- ❌ SQL injection (use parameterized queries)
- ❌ Brute force (use rate limiting)
- ❌ Man-in-the-middle (use HTTPS)

## Error Handling

### CSRF Validation Failure

**Server Response:**
```json
{
  "error": "invalid_csrf_token",
  "message": "Invalid or missing CSRF token. Please refresh the page and try again."
}
```

**HTTP Status:** `403 Forbidden`

### Frontend Error Handling

```javascript
try {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(data)
  })
  
  if (response.status === 403) {
    const error = await response.json()
    if (error.error === 'invalid_csrf_token') {
      // Refresh token and retry
      await initCsrfToken()
      alert('Session expired. Please try again.')
    }
  }
} catch (error) {
  console.error('Request failed:', error)
}
```

## Configuration

### Environment Variables

```env
# Automatically configured based on NODE_ENV
NODE_ENV=production  # Enables secure cookies (HTTPS only)
```

### Custom Configuration

To exclude specific routes from CSRF protection:

```javascript
const { conditionalCsrf } = require('./lib/@system/Middleware')

// Exclude public API endpoints
app.use(conditionalCsrf(['/api/public', '/api/webhooks']))
```

## Testing

### Manual Testing

```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:4000/api/csrf-token

# 2. Make protected request WITH token
curl -b cookies.txt \
  -H "X-CSRF-Token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  http://localhost:4000/api/posts

# 3. Make protected request WITHOUT token (should fail)
curl -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  http://localhost:4000/api/posts
```

### Automated Testing

```javascript
// In your test suite
describe('CSRF Protection', () => {
  it('should require CSRF token for POST requests', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: 'Test' })
      .expect(403)
    
    expect(response.body.error).toBe('invalid_csrf_token')
  })
  
  it('should accept valid CSRF token', async () => {
    // Get token
    const tokenResponse = await request(app)
      .get('/api/csrf-token')
      .expect(200)
    
    const csrfToken = tokenResponse.body.csrfToken
    const cookies = tokenResponse.headers['set-cookie']
    
    // Use token
    await request(app)
      .post('/api/posts')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ title: 'Test' })
      .expect(201)
  })
})
```

## Production Checklist

- ✅ CSRF middleware enabled
- ✅ SameSite=Lax on all session cookies
- ✅ HTTPS enabled (secure cookies)
- ✅ CORS configured correctly
- ✅ CSP headers set
- ✅ Error logging for CSRF violations
- ✅ Frontend CSRF token handling
- ✅ Token refresh on expiry
- ✅ Tests for CSRF protection

## Monitoring

### Log CSRF Violations

CSRF failures are automatically logged with:
- Request method and URL
- Client IP address
- User agent
- Timestamp

Example log entry:
```json
{
  "level": "warn",
  "type": "csrf_violation",
  "method": "POST",
  "url": "/api/posts",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "time": "2026-03-10T17:30:00.000Z"
}
```

### Alerts

Set up alerts for:
- High rate of CSRF violations (possible attack)
- CSRF failures from specific IPs
- Unusual patterns (e.g., old tokens being reused)

## Troubleshooting

### Token Expired Error

**Symptom:** Users see "Invalid CSRF token" after page idle

**Solution:** 
- Token expires after 1 hour (configurable)
- Frontend should refresh token when it expires
- Implement token refresh on 403 errors

### Token Not Being Sent

**Symptom:** All POST requests fail with CSRF error

**Causes:**
1. Missing `credentials: 'include'` in fetch
2. CORS not configured correctly
3. Cookies blocked by browser

**Solution:**
```javascript
fetch('/api/posts', {
  credentials: 'include', // ✅ Required!
  headers: { 'X-CSRF-Token': token }
})
```

### Development Mode Issues

**Issue:** CSRF protection interfering with development

**Solution:** Disable CSRF in development:
```javascript
if (process.env.NODE_ENV !== 'development') {
  app.use(csrfProtection)
}
```

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [csurf npm package](https://www.npmjs.com/package/csurf)
- [SameSite Cookies Explained](https://web.dev/samesite-cookies-explained/)
- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

**Implementation Date:** March 10, 2026  
**Tasks:** #10361 (CSRF Middleware), #10362 (SameSite=Lax)  
**Status:** ✅ Complete and Production-Ready
