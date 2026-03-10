# Content Security Policy (CSP) Implementation
**Task #10360 - XSS Protection with CSP Headers**

## Overview

Content Security Policy (CSP) headers have been implemented across all products to prevent Cross-Site Scripting (XSS) attacks. CSP is a critical security layer that controls which resources can be loaded and executed on web pages.

## What Was Implemented

### Products Updated
✅ **Splice** - Enhanced existing security middleware  
✅ **LetterFlow** - Added new security middleware  
✅ **LinkForge** - Added new security middleware  
✅ **Planora** - Added new security middleware  

### Security Headers Added

All products now include the following security headers via `helmet.js`:

#### 1. **Content-Security-Policy (CSP)** - XSS Protection
Controls which resources can be loaded and executed:
- `default-src 'self'` - Only allow resources from same origin
- `script-src 'self'` - Only allow scripts from same origin (prevents inline script injection)
- `style-src 'self' 'unsafe-inline'` - Allow same-origin styles + inline (for CSS-in-JS frameworks)
- `img-src 'self' data: https: blob:` - Allow images from safe sources
- `object-src 'none'` - Block Flash, Java applets (common XSS vectors)
- `frame-src 'none'` - Prevent embedding untrusted iframes
- `frame-ancestors 'none'` - Prevent this site being embedded (clickjacking protection)
- `upgrade-insecure-requests` - Automatically upgrade HTTP to HTTPS in production

#### 2. **Strict-Transport-Security (HSTS)**
Forces HTTPS connections in production:
- `max-age: 31536000` (1 year)
- `includeSubDomains: true`
- `preload: true` (eligible for browser preload list)

#### 3. **X-Frame-Options**
Prevents clickjacking attacks:
- `DENY` - Cannot be embedded in any iframe

#### 4. **X-Content-Type-Options**
Prevents MIME sniffing:
- `nosniff` - Forces declared content type

#### 5. **Referrer-Policy**
Controls referrer information leakage:
- `strict-origin-when-cross-origin`

#### 6. **Cross-Origin Policies**
Isolates browsing contexts:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-site`

#### 7. **Permissions-Policy**
Disables unnecessary browser features:
- Camera, microphone, geolocation, payment, USB all disabled

## File Structure

```
products/
├── splice/
│   └── server/src/lib/@system/Middleware/
│       └── security.js (enhanced)
├── letterflow/
│   └── server/
│       ├── index.js (updated)
│       └── middleware/
│           └── security.js (new)
├── linkforge/
│   └── server/
│       ├── index.js (updated)
│       └── middleware/
│           └── security.js (new)
└── planora/
    └── server/
        ├── index.js (updated)
        └── middleware/
            └── security.js (new)
```

## How It Works

### Middleware Order
Security headers MUST be applied first in the middleware chain:

```javascript
const securityHeaders = require('./middleware/security');

// Security headers - MUST BE FIRST
app.use(securityHeaders);

// Then other middleware
app.use(cors());
app.use(express.json());
// ... rest of middleware
```

### Production vs Development

CSP automatically adjusts based on environment:

**Production** (`NODE_ENV=production`):
- HSTS enabled (forces HTTPS)
- `upgradeInsecureRequests` enabled
- Stricter policies

**Development**:
- HSTS disabled (allows HTTP)
- More permissive for debugging

## Testing CSP

### 1. Check Headers
```bash
curl -I https://your-domain.com/api/health
```

Look for:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### 2. Browser Console
Open browser DevTools Console. CSP violations will appear as:
```
Refused to load the script 'https://evil.com/xss.js' because it violates the following Content Security Policy directive: "script-src 'self'"
```

### 3. Test XSS Protection
Try injecting a script (should be blocked):
```html
<img src=x onerror="alert('XSS')">
```

CSP will block the inline JavaScript execution.

## Customizing CSP

### Adding Trusted CDNs
If you need to load scripts from CDNs, update the security middleware:

```javascript
scriptSrc: [
  "'self'",
  'https://cdn.jsdelivr.net',
  'https://unpkg.com',
],
```

### Adding API Domains
If your API is on a different domain:

```javascript
connectSrc: [
  "'self'",
  'https://api.yourdomain.com',
],
```

### Allowing Inline Scripts (NOT RECOMMENDED)
Only if absolutely necessary:

```javascript
scriptSrc: ["'self'", "'unsafe-inline'"],
```

**Warning**: `'unsafe-inline'` defeats CSP's XSS protection. Use nonces or hashes instead.

## CSP Violation Reporting

To monitor CSP violations in production, add a reporting endpoint:

```javascript
// In security.js
contentSecurityPolicy: {
  directives: {
    // ... other directives
    reportUri: '/api/csp-violations',
  },
},

// Add this route to your server
app.post('/api/csp-violations', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);
  // Log to monitoring service (Sentry, Datadog, etc.)
  res.status(204).end();
});
```

## Dependencies

All products require `helmet` package:

```bash
npm install helmet
```

Already included in package.json for all products.

## Troubleshooting

### Issue: Styles not loading
**Solution**: Add CDN to `styleSrc`:
```javascript
styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
```

### Issue: API calls blocked
**Solution**: Add API domain to `connectSrc`:
```javascript
connectSrc: ["'self'", process.env.API_URL],
```

### Issue: Images from external sources blocked
**Solution**: Already handled with `imgSrc: ['self', 'data:', 'https:']`

## Security Benefits

✅ **XSS Prevention** - Blocks unauthorized script execution  
✅ **Clickjacking Protection** - Prevents iframe embedding attacks  
✅ **MIME Sniffing Protection** - Forces correct content types  
✅ **HTTPS Enforcement** - Upgrades insecure requests in production  
✅ **Information Leakage Prevention** - Controls referrer data  
✅ **Attack Surface Reduction** - Disables unnecessary browser features  

## Compliance

This implementation helps meet security requirements for:
- OWASP Top 10 (A03:2021 - Injection)
- PCI DSS 6.5.7 (Cross-site scripting)
- SOC 2 security controls
- GDPR data protection requirements

## References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CSP Evaluator Tool](https://csp-evaluator.withgoogle.com/)

---

**Implementation Date**: 2026-03-10  
**Task**: #10360  
**Agent**: Junior Agent (Task Mode)  
**Status**: ✅ Complete - CSP headers deployed across all products
