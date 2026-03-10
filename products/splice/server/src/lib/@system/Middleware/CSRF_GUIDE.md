# CSRF Protection Guide
**Task #10361 - Implement csurf middleware in product template**

## Overview

This application implements CSRF (Cross-Site Request Forgery) protection using the `csurf` middleware package. CSRF protection prevents attackers from tricking authenticated users into performing unwanted actions on your application.

## How CSRF Works

### The Attack Scenario (Without Protection)

1. User logs into your app at `yourapp.com` and gets a session cookie
2. User visits a malicious site `evil.com`
3. `evil.com` contains a form that submits to `yourapp.com/api/delete-account`
4. Browser automatically includes the session cookie with the request
5. Your app processes the request as if the user intentionally submitted it
6. ❌ User's account gets deleted without their knowledge

### The Protection (With CSRF Tokens)

1. Server generates a unique CSRF token and stores it in a cookie
2. Client must include this token in state-changing requests (POST, PUT, DELETE)
3. Server validates that the token in the request matches the cookie
4. Malicious sites can't read the token (Same-Origin Policy)
5. ✅ Unauthorized requests are rejected

## Implementation Details

### Server-Side

CSRF protection is automatically applied to:
- ✅ POST requests
- ✅ PUT requests
- ✅ PATCH requests
- ✅ DELETE requests

CSRF protection is **NOT** applied to:
- ❌ GET requests (read-only, should be safe)
- ❌ HEAD requests
- ❌ OPTIONS requests

### Token Storage

The CSRF token is stored in a cookie with these security settings:

```javascript
{
  key: '_csrf',
  httpOnly: true,      // JavaScript cannot access it
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // Maximum protection
  maxAge: 3600,        // 1 hour lifetime
}
```

## Client-Side Integration

### React Example (Recommended)

```javascript
// src/lib/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important: Send cookies with requests
});

// Fetch CSRF token on app initialization
let csrfToken = null;

export async function initCsrfProtection() {
  try {
    const response = await api.get('/csrf-token');
    csrfToken = response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

// Add CSRF token to all requests
api.interceptors.request.use((config) => {
  // Skip for GET/HEAD/OPTIONS
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (csrfToken) {
      // Add token to header (recommended)
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Handle CSRF errors (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.error === 'invalid_csrf_token') {
      // Token expired, get a new one
      await initCsrfProtection();
      // Retry the original request
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api;
```

```javascript
// src/index.js or src/App.js
import { initCsrfProtection } from './lib/api';

// Initialize CSRF protection when app loads
initCsrfProtection();
```

### Vanilla JavaScript / Fetch API

```javascript
// Get CSRF token
let csrfToken = null;

async function getCsrfToken() {
  const response = await fetch('/api/csrf-token', {
    credentials: 'include', // Include cookies
  });
  const data = await response.json();
  csrfToken = data.csrfToken;
}

// Call on page load
getCsrfToken();

// Use in requests
async function deleteItem(id) {
  const response = await fetch(`/api/items/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken, // Add CSRF token
    },
  });
  
  if (response.status === 403) {
    // CSRF token invalid, refresh and retry
    await getCsrfToken();
    return deleteItem(id); // Retry
  }
  
  return response.json();
}
```

### Form Submissions (Traditional HTML Forms)

```html
<!-- Add hidden input with CSRF token -->
<form action="/api/profile" method="POST">
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  <input type="text" name="name" placeholder="Your name">
  <button type="submit">Update Profile</button>
</form>
```

## Token Passing Methods

The client can pass the CSRF token in three ways (in order of preference):

### 1. Custom Header (Recommended)

```javascript
headers: {
  'X-CSRF-Token': token,  // or 'CSRF-Token'
}
```

**Pros:**
- Clean and explicit
- Works with all content types
- Preferred for AJAX/SPA applications

### 2. Request Body

```javascript
// JSON
body: JSON.stringify({
  _csrf: token,
  data: {...}
})

// Form data
const formData = new FormData();
formData.append('_csrf', token);
```

**Pros:**
- Works with traditional form submissions

**Cons:**
- Pollutes request body
- Need to filter out `_csrf` field in backend

### 3. Query String (Least Secure)

```
POST /api/items?_csrf=token
```

**Pros:**
- Simple for testing

**Cons:**
- Token may be logged in server logs
- Token visible in browser history
- **Not recommended for production**

## Testing

### Manual Testing with cURL

```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:3000/api/csrf-token

# 2. Make request with token
TOKEN=$(curl -b cookies.txt http://localhost:3000/api/csrf-token | jq -r '.csrfToken')

curl -X POST http://localhost:3000/api/items \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{"name": "Test Item"}'
```

### Testing CSRF Protection

```bash
# This should FAIL with 403 (no token)
curl -X POST http://localhost:3000/api/items \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item"}'

# Response: {"error":"invalid_csrf_token","message":"Invalid or missing CSRF token..."}
```

### Jest/Integration Tests

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Test' })
      .expect(403);
    
    expect(response.body.error).toBe('invalid_csrf_token');
  });

  it('should accept POST with valid CSRF token', async () => {
    // Get CSRF token
    const tokenResponse = await request(app)
      .get('/api/csrf-token')
      .expect(200);
    
    const csrfToken = tokenResponse.body.csrfToken;
    const cookies = tokenResponse.headers['set-cookie'];

    // Make request with token
    const response = await request(app)
      .post('/api/items')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Test Item' })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

## Disabling CSRF (Development Only)

For development or specific endpoints (like webhooks), you can conditionally disable CSRF:

### Option 1: Exclude Specific Routes

```javascript
// app.js
const { conditionalCsrf } = require('./lib/@system/Middleware');

// Exclude webhook endpoints from CSRF
app.use(conditionalCsrf([
  '/api/webhooks/stripe',
  '/api/webhooks/github',
]));
```

### Option 2: Disable in Test Environment

```javascript
// app.js
if (process.env.NODE_ENV !== 'test') {
  app.use(csrfProtection);
}
```

### Option 3: Per-Route Exemption

```javascript
// routes/webhooks.js
const express = require('express');
const router = express.Router();

// This route bypasses CSRF (called before global CSRF middleware)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  // Handle webhook
});

module.exports = router;
```

## Security Best Practices

### ✅ DO

- Always use HTTPS in production
- Set `secure: true` on cookies in production
- Use `sameSite: 'strict'` for maximum protection
- Rotate CSRF tokens on authentication state changes
- Log CSRF violations for security monitoring
- Keep tokens short-lived (1 hour is good)

### ❌ DON'T

- Don't disable CSRF in production without good reason
- Don't pass tokens in URLs (use headers or body)
- Don't store tokens in localStorage (XSS risk)
- Don't use the same token for multiple sessions
- Don't expose tokens in error messages or logs

## Common Issues & Solutions

### Issue: "Invalid CSRF token" on every request

**Cause:** Cookies not being sent with requests

**Solution:**
```javascript
// Make sure withCredentials is set
axios.defaults.withCredentials = true;

// Or with fetch
fetch(url, { credentials: 'include' });
```

---

### Issue: CSRF token works in Postman but not in browser

**Cause:** CORS or cookie settings

**Solution:**
- Check CORS allows credentials: `credentials: true`
- Check cookie domain matches your frontend domain
- Verify `sameSite` setting (use 'lax' if frontend is on different subdomain)

---

### Issue: Token expires too quickly

**Solution:** Increase token lifetime
```javascript
// csrf.js
cookie: {
  maxAge: 7200, // 2 hours instead of 1
}
```

---

### Issue: Breaking change for existing API clients

**Solution:** Gradual rollout
```javascript
// Start with warnings only (don't reject)
const csrfProtection = csrf({
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST'], // Temporarily allow POST
});

// Monitor logs, then remove POST from ignoreMethods
```

## Webhooks & External Services

External services (Stripe, GitHub, etc.) can't include CSRF tokens. Exclude these endpoints:

```javascript
// app.js

// Webhook routes (no CSRF needed - use webhook signatures instead)
app.post('/api/webhooks/stripe', stripeWebhook);
app.post('/api/webhooks/github', githubWebhook);

// Then apply CSRF to remaining routes
app.use(csrfProtection);
app.use('/api', apiRoutes);
```

## Migration from No CSRF

If you're adding CSRF to an existing application:

1. **Add the middleware** (this PR)
2. **Update frontend** to fetch and include tokens
3. **Monitor errors** - watch for 403s in production
4. **Gradual rollout** - start with warning logs only
5. **Update documentation** - notify API consumers
6. **Test thoroughly** - especially form submissions

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [csurf npm package](https://www.npmjs.com/package/csurf)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated:** Task #10361  
**Status:** Implemented and ready for use
