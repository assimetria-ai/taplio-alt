# Custom Domain Configuration Guide
**Task #10311 - Build custom short domain configuration**

## Overview

LinkForge supports custom branded short domains, allowing you to use your own domain (e.g., `go.brand.com`) instead of the default `linkforge.app` domain for your short links.

## Features

✅ **Custom Domain Support** - Use your own branded domain  
✅ **DNS Verification** - Automated DNS record validation  
✅ **SSL/HTTPS Setup Guide** - Step-by-step SSL configuration  
✅ **Multiple Domains** - Add multiple custom domains per account  
✅ **Domain Management** - Easy setup, verification, and management  
✅ **HTTPS Redirect** - Automatic HTTP → HTTPS redirects  

## Setup Process

### Step 1: Add Custom Domain

```bash
POST /api/domains
Content-Type: application/json
Authorization: Bearer <token>

{
  "domain": "go.yourbrand.com"
}
```

**Response:**
```json
{
  "domain": {
    "id": "clxxx",
    "domain": "go.yourbrand.com",
    "status": "pending",
    "verificationToken": "abc123...",
    "createdAt": "2024-03-10T..."
  },
  "dnsInstructions": {
    "step1": {
      "title": "Add DNS Records",
      "records": [...]
    }
  }
}
```

### Step 2: Configure DNS

Add the following DNS records at your domain provider (GoDaddy, Cloudflare, Namecheap, etc.):

#### Record 1: Verification TXT Record

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | `_linkforge-verify.go.yourbrand.com` | `linkforge-verify=<token>` | 3600 |

This proves you own the domain.

#### Record 2: Point Domain to LinkForge

**Option A: A Record** (recommended for simple setups)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `go.yourbrand.com` | `<SERVER_IP>` | 3600 |

**Option B: CNAME Record** (recommended for CDN/Cloudflare users)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `go.yourbrand.com` | `linkforge.app` | 3600 |

### Step 3: Wait for DNS Propagation

DNS changes typically take 5-30 minutes, but can take up to 48 hours to propagate globally.

**Check propagation status:**
- https://dnschecker.org/#TXT/_linkforge-verify.go.yourbrand.com
- https://dnschecker.org/#A/go.yourbrand.com

### Step 4: Verify Domain

Once DNS records are propagated, verify your domain:

```bash
POST /api/domains/:id/verify
Authorization: Bearer <token>
```

**Response (success):**
```json
{
  "verified": true,
  "message": "Domain successfully verified!",
  "domain": {
    "id": "clxxx",
    "domain": "go.yourbrand.com",
    "status": "verified",
    "verifiedAt": "2024-03-10T..."
  },
  "nextSteps": {
    "title": "SSL Certificate Setup",
    "options": [...]
  }
}
```

**Response (failed):**
```json
{
  "verified": false,
  "error": "DNS verification TXT record not found",
  "details": "Expected TXT record at ..."
}
```

### Step 5: Setup SSL/HTTPS

Choose one of the following SSL options:

## SSL Setup Options

### Option 1: Cloudflare (Recommended - Free & Easy)

**Pros:** Free, automatic renewal, CDN included, DDoS protection  
**Setup time:** 10-15 minutes

**Steps:**
1. Sign up at https://cloudflare.com (free plan available)
2. Add your root domain (e.g., `yourbrand.com`) to Cloudflare
3. Update nameservers at your domain registrar to Cloudflare's nameservers
4. In Cloudflare dashboard:
   - Go to **SSL/TLS** → Set mode to **Full (strict)**
   - Cloudflare automatically provisions SSL certificate
   - Go to **DNS** → Verify your `go` subdomain record
5. Wait 10-15 minutes for certificate activation
6. Update domain in LinkForge:

```bash
PUT /api/domains/:id
Content-Type: application/json

{
  "sslStatus": "active",
  "sslProvider": "cloudflare"
}
```

**Cloudflare SSL Settings:**
```
SSL/TLS encryption mode: Full (strict)
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS Version: 1.2
```

### Option 2: Let's Encrypt (Self-Managed - Free)

**Pros:** Free, direct control, auto-renewal  
**Setup time:** 15-30 minutes  
**Requires:** SSH access to server

**Steps:**
1. SSH into your LinkForge server
2. Install Certbot:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

3. Obtain certificate:
   ```bash
   sudo certbot --nginx -d go.yourbrand.com
   ```

4. Follow prompts:
   - Enter email for urgent renewal notices
   - Agree to terms of service
   - Choose: Redirect HTTP to HTTPS (recommended)

5. Certbot automatically:
   - Obtains certificate from Let's Encrypt
   - Configures Nginx with HTTPS
   - Sets up auto-renewal (runs twice daily)

6. Verify auto-renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

7. Update domain in LinkForge:
   ```bash
   PUT /api/domains/:id
   {
     "sslStatus": "active",
     "sslProvider": "letsencrypt",
     "sslExpiresAt": "2024-06-10T..."
   }
   ```

### Option 3: Manual Certificate (Advanced)

**Pros:** Full control, extended validation options  
**Setup time:** 30-60 minutes

**Steps:**
1. Purchase SSL certificate from provider (DigiCert, Comodo, Sectigo, etc.)
2. Generate Certificate Signing Request (CSR):
   ```bash
   openssl req -new -newkey rsa:2048 -nodes \
     -keyout go.yourbrand.com.key \
     -out go.yourbrand.com.csr
   ```
3. Submit CSR to SSL provider
4. Download certificate files
5. Install certificate on server (Nginx/Apache configuration)
6. Set up renewal reminder (certificates expire after 1 year)

## API Reference

### List Custom Domains

```bash
GET /api/domains
Authorization: Bearer <token>
```

**Response:**
```json
{
  "domains": [
    {
      "id": "clxxx",
      "domain": "go.brand.com",
      "status": "verified",
      "sslStatus": "active",
      "isDefault": true,
      "linksCount": 42,
      "createdAt": "2024-03-10T...",
      "verifiedAt": "2024-03-10T..."
    }
  ]
}
```

### Get Domain Details

```bash
GET /api/domains/:id
Authorization: Bearer <token>
```

**Response includes:**
- Domain configuration
- DNS setup instructions
- SSL setup guide
- Current status
- Link count

### Update Domain Settings

```bash
PUT /api/domains/:id
Content-Type: application/json

{
  "isDefault": true,           // Set as default domain for new links
  "redirectHttps": true,        // Auto-redirect HTTP → HTTPS
  "sslStatus": "active"         // Update SSL status
}
```

### Delete Domain

```bash
DELETE /api/domains/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete domain with active links. Reassign or delete links first.

## Database Schema

### CustomDomain Model

```prisma
model CustomDomain {
  id                String    @id @default(cuid())
  userId            String
  domain            String    @unique
  status            String    @default("pending") // pending, verified, active, failed
  verificationToken String
  verifiedAt        DateTime?
  lastCheckedAt     DateTime?
  sslStatus         String    @default("pending")
  sslProvider       String?   // letsencrypt, cloudflare, custom
  sslExpiresAt      DateTime?
  isDefault         Boolean   @default(false)
  redirectHttps     Boolean   @default(true)
  metadata          Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  user              User      @relation(...)
  links             Link[]
}
```

## Using Custom Domains

Once verified, links created on your custom domain will use that domain:

### Create Link with Custom Domain

```bash
POST /api/links
Content-Type: application/json

{
  "targetUrl": "https://example.com/product",
  "slug": "promo",
  "domainId": "clxxx"  // Optional: specify custom domain
}
```

**Result:** `https://go.yourbrand.com/promo` → redirects to `https://example.com/product`

### Default Domain

Set a domain as default to use it for all new links automatically:

```bash
PUT /api/domains/:id
{ "isDefault": true }
```

## Troubleshooting

### DNS Verification Fails

**Problem:** "DNS verification TXT record not found"

**Solutions:**
1. Wait longer - DNS propagation can take up to 48 hours
2. Check DNS records at https://dnschecker.org
3. Verify TXT record name is exactly: `_linkforge-verify.yourdomain.com`
4. Ensure no typos in verification token
5. Try flushing DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Domain Not Pointing to Server

**Problem:** "Neither A nor CNAME record found"

**Solutions:**
1. Add A record pointing to server IP, OR
2. Add CNAME record pointing to `linkforge.app`
3. Cannot have both A and CNAME for same subdomain
4. Verify at https://dnschecker.org

### SSL Certificate Issues

**Problem:** "Not Secure" warning in browser

**Solutions:**
1. Ensure SSL certificate is properly installed
2. Check certificate expiration date
3. Verify HTTPS redirect is enabled
4. Test certificate: https://www.ssllabs.com/ssltest/
5. For Cloudflare: Enable "Always Use HTTPS"
6. For Let's Encrypt: Check certbot renewal status

### Links Not Working on Custom Domain

**Problem:** 404 errors on custom domain

**Solutions:**
1. Verify domain status is "verified"
2. Check server is running and accessible
3. Verify DNS points to correct server
4. Check server logs for errors
5. Test with curl:
   ```bash
   curl -I https://go.yourbrand.com/testslug
   ```

## Security Best Practices

1. **Always use HTTPS** - Set `redirectHttps: true`
2. **Keep certificates updated** - Monitor expiration dates
3. **Use strong DNS providers** - Cloudflare, Route 53, etc.
4. **Enable DNSSEC** - If supported by your registrar
5. **Monitor domain ownership** - Set renewal reminders
6. **Regular verification checks** - Re-verify DNS periodically

## Rate Limits

- **Domain additions:** 10 domains per user
- **Verification attempts:** 10 per hour per domain
- **DNS checks:** Cached for 5 minutes

## Support

For issues or questions:
- Check server logs: `tail -f /var/log/linkforge/error.log`
- Review DNS configuration
- Contact support with domain ID and error messages

## Environment Variables

Required server configuration:

```env
# Primary domain (default domain)
PRIMARY_DOMAIN=linkforge.app

# Server IP for A record instructions
SERVER_IP=123.456.789.0

# Server domain for CNAME instructions
SERVER_DOMAIN=linkforge.app
```

## Migration Guide

### Moving Existing Links to Custom Domain

```bash
# Batch update links to new domain
PUT /api/links/batch-update
Content-Type: application/json

{
  "linkIds": ["id1", "id2", "id3"],
  "domainId": "custom-domain-id"
}
```

---

**Implementation Date:** March 10, 2024  
**Task ID:** #10311  
**Feature:** Custom Domain Configuration  
**Status:** ✅ Complete
