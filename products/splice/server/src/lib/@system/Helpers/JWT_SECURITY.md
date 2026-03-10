# JWT Security Guide
**Task #10364 - Harden JWT configuration in product template**

## Overview

This JWT implementation follows OWASP security best practices and RFC 7519 specifications to provide enterprise-grade token security.

## Security Features

### ✅ Implemented Security Measures

1. **RS256 Asymmetric Signing**
   - Prevents secret confusion attacks
   - Public key can be safely distributed
   - Private key never leaves the server

2. **Short-Lived Access Tokens**
   - Default: 15 minutes
   - Reduces window of exposure if token is compromised
   - Forces regular token refresh

3. **JWT ID (jti) Claim**
   - Unique identifier for each token
   - Enables precise token revocation
   - Required for audit trails

4. **Issuer (iss) and Audience (aud) Validation**
   - Prevents token reuse across different services
   - Validates token was issued by correct authority
   - Validates token is intended for this application

5. **Subject (sub) Claim**
   - User ID stored in standard claim
   - Enables federated identity integration
   - Follows JWT best practices

6. **Not Before (nbf) Claim**
   - Prevents premature token use
   - Handles clock skew scenarios
   - Optional activation delay

7. **Token Fingerprinting**
   - Binds token to specific browser/device
   - SHA-256 hash of user-agent + IP
   - Detects session hijacking attempts

8. **Comprehensive Claim Validation**
   - Validates all required claims
   - Type checking on critical fields
   - Prevents malformed tokens

9. **Clock Tolerance**
   - 10-second tolerance for exp/nbf validation
   - Handles reasonable clock skew
   - Prevents false rejections

10. **Timing Attack Prevention**
    - Generic error messages
    - Consistent response times
    - No information leakage

## Configuration

### Environment Variables

```env
# ── Required JWT Configuration ──────────────────────────────────────────────

# Option A: File-based keys (recommended for development)
JWT_PRIVATE_KEY_FILE=./keys/jwt_private.pem
JWT_PUBLIC_KEY_FILE=./keys/jwt_public.pem

# Option B: Inline keys (recommended for production with secrets managers)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIB..."

# ── Optional Configuration ──────────────────────────────────────────────────

# Token expiration (default: 15m)
# Format: https://github.com/vercel/ms (e.g., 15m, 1h, 7d)
ACCESS_TOKEN_TTL=15m

# JWT issuer - your application identifier (default: splice-app)
JWT_ISSUER=splice-app

# JWT audience - intended recipients (default: splice-client)
JWT_AUDIENCE=splice-client

# Clock tolerance in seconds (default: 10)
# Allows for reasonable clock skew between servers
JWT_CLOCK_TOLERANCE=10
```

### Generating Keys

**Option 1: npm script (recommended)**

```bash
npm run generate-keys
```

This will:
- Generate a 2048-bit RSA key pair
- Create `keys/` directory
- Write `jwt_private.pem` and `jwt_public.pem`
- Update `.env` file automatically

**Option 2: OpenSSL (manual)**

```bash
# Create keys directory
mkdir -p keys

# Generate private key (2048-bit RSA)
openssl genrsa -out keys/jwt_private.pem 2048

# Extract public key
openssl rsa -in keys/jwt_private.pem -pubout -out keys/jwt_public.pem

# Secure permissions (Unix/Linux/Mac)
chmod 600 keys/jwt_private.pem
chmod 644 keys/jwt_public.pem
```

**Option 3: Node.js crypto (programmatic)**

```javascript
const crypto = require('crypto')
const fs = require('fs')

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

fs.writeFileSync('keys/jwt_private.pem', privateKey)
fs.writeFileSync('keys/jwt_public.pem', publicKey)
```

### Production Deployment

#### Railway / Render / Heroku

Use environment variables for keys:

```bash
# Copy key content (preserves newlines)
cat keys/jwt_private.pem | pbcopy  # Mac
cat keys/jwt_private.pem | xclip   # Linux

# Paste into environment variable
# Railway: Settings → Environment Variables → JWT_PRIVATE_KEY
# Render: Environment → Add Environment Variable
# Heroku: Settings → Config Vars
```

**Important:** The module automatically handles `\n` escaping from secrets managers.

#### AWS Secrets Manager / GCP Secret Manager

1. Store keys in secrets manager
2. Fetch at application startup
3. Set environment variables in memory
4. Never write to disk in production

Example (AWS):

```javascript
const AWS = require('aws-sdk')
const secretsManager = new AWS.SecretsManager()

async function loadJWTKeys() {
  const secret = await secretsManager.getSecretValue({ 
    SecretId: 'prod/jwt-keys' 
  }).promise()
  
  const keys = JSON.parse(secret.SecretString)
  process.env.JWT_PRIVATE_KEY = keys.privateKey
  process.env.JWT_PUBLIC_KEY = keys.publicKey
}
```

#### Docker

```dockerfile
# DO NOT include keys in image
# Mount as secrets or environment variables

# Option 1: Docker secrets
docker run \
  --secret jwt_private_key \
  --secret jwt_public_key \
  myapp

# Option 2: Environment variables
docker run \
  -e JWT_PRIVATE_KEY="$(cat keys/jwt_private.pem)" \
  -e JWT_PUBLIC_KEY="$(cat keys/jwt_public.pem)" \
  myapp
```

## Usage

### Basic Token Generation

```javascript
const { signAccessToken } = require('./lib/@system/Helpers/jwt')

// Sign token with user data
const token = signAccessToken({ userId: 123 })

// Token contains:
// {
//   jti: "abc123...",           // Unique token ID
//   iss: "splice-app",          // Issuer
//   aud: "splice-client",       // Audience
//   sub: "123",                 // Subject (user ID)
//   userId: 123,                // User ID (custom claim)
//   iat: 1678901234,            // Issued at
//   nbf: 1678901234,            // Not before
//   exp: 1678902134             // Expires (iat + 15m)
// }
```

### Token Generation with Fingerprinting (Recommended)

```javascript
const { signAccessTokenAsync, generateFingerprint } = require('./lib/@system/Helpers/jwt')

router.post('/login', async (req, res) => {
  // ... authenticate user ...
  
  // Generate fingerprint from request
  const fingerprint = generateFingerprint(req)
  
  // Sign token with fingerprint
  const token = await signAccessTokenAsync(
    { userId: user.id },
    { fingerprint }
  )
  
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000
  })
  
  res.json({ user })
})
```

### Token Verification

```javascript
const { verifyAccessToken, generateFingerprint } = require('./lib/@system/Helpers/jwt')

// Basic verification
try {
  const payload = verifyAccessToken(token)
  console.log('User ID:', payload.userId)
} catch (err) {
  // Token invalid, expired, or tampered
  console.error('Verification failed:', err.message)
}

// Verification with fingerprint (recommended)
const fingerprint = generateFingerprint(req)
try {
  const payload = verifyAccessToken(token, { fingerprint })
  // Token valid and fingerprint matches
} catch (err) {
  if (err.message.includes('fingerprint')) {
    // Possible session hijacking attempt!
    console.error('Security alert:', err.message)
  }
}
```

### Custom Token Options

```javascript
// Custom expiration
const token = signAccessToken(
  { userId: 123 },
  { expiresIn: '1h' }
)

// Custom JWT ID (for tracking)
const token = signAccessToken(
  { userId: 123 },
  { jti: 'session-abc-123' }
)

// Custom issuer/audience
const token = signAccessToken(
  { userId: 123 },
  { 
    iss: 'api.myapp.com',
    aud: 'mobile-app'
  }
)
```

## Security Best Practices

### ✅ DO

1. **Keep access tokens short-lived** (15-30 minutes max)
2. **Use token fingerprinting** for session binding
3. **Store tokens in httpOnly cookies** (never localStorage)
4. **Use sameSite=lax** or sameSite=strict for cookies
5. **Enable HTTPS only** (secure: true) in production
6. **Validate all claims** on every request
7. **Log security events** (hijacking attempts, validation failures)
8. **Rotate keys regularly** (every 6-12 months)
9. **Monitor token usage** patterns for anomalies
10. **Implement token blacklisting** for revocation

### ❌ DON'T

1. **Don't store tokens in localStorage** (XSS vulnerable)
2. **Don't use long-lived access tokens** (> 1 hour)
3. **Don't include sensitive data** in JWT payload
4. **Don't use HS256 in production** (symmetric = vulnerable to key confusion)
5. **Don't reuse JTI values** (defeats revocation)
6. **Don't skip fingerprint validation** if implemented
7. **Don't expose detailed error messages** (timing attacks)
8. **Don't commit keys to version control**
9. **Don't use same keys across environments**
10. **Don't disable HTTPS** in production

## Token Claims Reference

### Standard Claims (RFC 7519)

| Claim | Name | Description | Required |
|-------|------|-------------|----------|
| `jti` | JWT ID | Unique token identifier | ✅ Yes |
| `iss` | Issuer | Who issued the token | ✅ Yes |
| `aud` | Audience | Intended recipient | ✅ Yes |
| `sub` | Subject | Subject (user ID string) | ✅ Yes |
| `iat` | Issued At | Token creation timestamp | ✅ Yes |
| `exp` | Expiration | Token expiry timestamp | ✅ Yes |
| `nbf` | Not Before | Token activation time | ✅ Yes |

### Custom Claims

| Claim | Description | Type |
|-------|-------------|------|
| `userId` | User ID (number) | number |
| `fp` | Fingerprint (session binding) | string |
| (any) | Additional user data | any |

## Token Revocation

### Individual Token Revocation (Blacklist)

```javascript
// In sessions.js or auth controller
const { client: redis } = require('./lib/@system/Redis')

async function blacklistToken(token) {
  const payload = await verifyTokenAsync(token)
  const ttl = payload.exp - Math.floor(Date.now() / 1000)
  
  if (ttl > 0) {
    await redis.set(`blacklist:${payload.jti}`, '1', 'EX', ttl)
  }
}

async function isBlacklisted(token) {
  const payload = await verifyTokenAsync(token)
  return (await redis.exists(`blacklist:${payload.jti}`)) === 1
}

// In authenticate middleware
if (await isBlacklisted(token)) {
  return res.status(401).json({ message: 'Unauthorized' })
}
```

### User-Level Revocation

```javascript
// Add to users table
ALTER TABLE users ADD COLUMN tokens_invalidated_at TIMESTAMP;

// In authenticate middleware
if (user.tokens_invalidated_at && payload.iat < user.tokens_invalidated_at / 1000) {
  return res.status(401).json({ message: 'Session expired. Please log in again.' })
}

// Revoke all user tokens
UPDATE users SET tokens_invalidated_at = NOW() WHERE id = ?;
```

## Monitoring & Auditing

### Events to Log

```javascript
// Security events
logger.warn({
  event: 'jwt_fingerprint_mismatch',
  userId: payload.userId,
  jti: payload.jti,
  ip: req.ip,
  userAgent: req.headers['user-agent']
}, 'Possible session hijacking attempt')

logger.warn({
  event: 'jwt_expired_token_used',
  userId: payload.userId,
  jti: payload.jti,
  expired: payload.exp
}, 'Expired token attempted')

logger.info({
  event: 'jwt_issued',
  userId: user.id,
  jti: payload.jti,
  expiresIn: '15m'
}, 'Access token issued')
```

### Metrics to Track

- Token generation rate
- Verification failure rate
- Fingerprint mismatch rate
- Average token lifetime
- Blacklisted token count
- Expired token usage attempts

## Troubleshooting

### Token Verification Fails

**Problem:** `JsonWebTokenError: invalid signature`

**Solutions:**
- Verify PUBLIC_KEY matches the PRIVATE_KEY used to sign
- Check key format (PEM, not DER or JWK)
- Ensure no extra whitespace in keys
- Verify algorithm is RS256

### Token Expired

**Problem:** `TokenExpiredError: jwt expired`

**Solutions:**
- Normal behavior for security
- Implement token refresh flow
- Increase ACCESS_TOKEN_TTL if too short
- Check server clock sync (NTP)

### Clock Skew Issues

**Problem:** Tokens rejected immediately after creation

**Solutions:**
- Increase JWT_CLOCK_TOLERANCE (default: 10s)
- Sync server clocks with NTP
- Use nbf claim with small delay
- Check system time on all servers

### Fingerprint Mismatch

**Problem:** `Token fingerprint mismatch`

**Solutions:**
- User changed network (mobile → wifi)
- Behind load balancer with changing IPs
- Browser updated (user-agent changed)
- Consider less strict fingerprinting
- Allow fingerprint refresh mechanism

## Migration Guide

### From HS256 to RS256

```javascript
// Old (HS256 - symmetric)
const token = jwt.sign({ userId: 123 }, SECRET, { algorithm: 'HS256' })

// New (RS256 - asymmetric)
const token = signAccessToken({ userId: 123 })
```

**Breaking changes:**
- Must generate RSA key pair
- Must update all verification code
- Cannot use shared secret anymore
- Public key can be exposed safely

### Adding Fingerprinting to Existing System

1. Generate fingerprint at login
2. Include in token payload
3. Validate on protected routes
4. Graceful degradation: allow tokens without fingerprint temporarily
5. After transition period: require fingerprint

## References

- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT.io - Debugger & Resources](https://jwt.io/)
- [Auth0 JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)

## Security Checklist

- [ ] RSA key pair generated (2048-bit minimum)
- [ ] Private key secured (600 permissions, encrypted at rest)
- [ ] Keys not in version control
- [ ] Short access token TTL (≤ 30 minutes)
- [ ] Token fingerprinting enabled
- [ ] HttpOnly cookies for token storage
- [ ] sameSite=lax or strict
- [ ] secure=true in production (HTTPS only)
- [ ] Token blacklist implemented
- [ ] Comprehensive logging enabled
- [ ] Clock sync (NTP) configured
- [ ] Token refresh flow implemented
- [ ] Security monitoring dashboard created
- [ ] Incident response plan documented

---

**Implementation Date:** March 10, 2024  
**Task ID:** #10364  
**Feature:** JWT Security Hardening  
**Status:** ✅ Production Ready
