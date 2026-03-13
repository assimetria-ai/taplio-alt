/**
 * Custom Domain Management API
 * Task #10311 - Build custom short domain configuration
 * 
 * Handles domain registration, DNS verification, and SSL setup
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const dns = require('dns').promises;
const { PrismaClient } = require('@prisma/client');

const { sanitizeMetadata } = require('../../server/utils/sanitize');

const prisma = new PrismaClient();

/**
 * Generate a random verification token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate domain format
 */
function isValidDomain(domain) {
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * GET /api/domains - List user's custom domains
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const domains = await prisma.customDomain.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        domain: true,
        status: true,
        verifiedAt: true,
        sslStatus: true,
        isDefault: true,
        createdAt: true,
        _count: {
          select: { links: true }
        }
      }
    });

    res.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

/**
 * POST /api/domains - Add a new custom domain
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { domain } = req.body;

    // Validate domain format
    if (!domain || !isValidDomain(domain)) {
      return res.status(400).json({ 
        error: 'Invalid domain format. Use format: subdomain.yourdomain.com' 
      });
    }

    // Check if domain already exists
    const existing = await prisma.customDomain.findUnique({
      where: { domain: domain.toLowerCase() }
    });

    if (existing) {
      return res.status(409).json({ 
        error: 'This domain is already registered',
        ownedByYou: existing.userId === userId
      });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create domain record
    const customDomain = await prisma.customDomain.create({
      data: {
        userId,
        domain: domain.toLowerCase(),
        verificationToken,
        status: 'pending',
        sslStatus: 'pending'
      }
    });

    // DNS setup instructions
    const dnsInstructions = generateDNSInstructions(domain, verificationToken);

    res.status(201).json({
      domain: customDomain,
      dnsInstructions
    });

  } catch (error) {
    console.error('Error adding domain:', error);
    res.status(500).json({ error: 'Failed to add domain' });
  }
});

/**
 * POST /api/domains/:id/verify - Verify domain DNS configuration
 */
router.post('/:id/verify', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    // Get domain
    const customDomain = await prisma.customDomain.findFirst({
      where: { id, userId }
    });

    if (!customDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    if (customDomain.status === 'verified') {
      return res.json({ 
        verified: true, 
        message: 'Domain already verified',
        domain: customDomain
      });
    }

    // Perform DNS verification
    const verificationResult = await verifyDNSRecords(
      customDomain.domain,
      customDomain.verificationToken
    );

    if (!verificationResult.success) {
      // Update last checked time
      await prisma.customDomain.update({
        where: { id },
        data: { 
          lastCheckedAt: new Date(),
          status: 'failed'
        }
      });

      return res.status(400).json({
        verified: false,
        error: verificationResult.error,
        details: verificationResult.details
      });
    }

    // DNS verified! Update domain
    const updated = await prisma.customDomain.update({
      where: { id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
        lastCheckedAt: new Date()
      }
    });

    res.json({
      verified: true,
      message: 'Domain successfully verified!',
      domain: updated,
      nextSteps: generateSSLInstructions(updated.domain)
    });

  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/domains/:id - Get domain details
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const customDomain = await prisma.customDomain.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { links: true }
        }
      }
    });

    if (!customDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Get setup instructions
    const dnsInstructions = generateDNSInstructions(
      customDomain.domain,
      customDomain.verificationToken
    );

    const sslInstructions = customDomain.status === 'verified' 
      ? generateSSLInstructions(customDomain.domain)
      : null;

    res.json({
      domain: customDomain,
      dnsInstructions,
      sslInstructions
    });

  } catch (error) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
});

/**
 * PUT /api/domains/:id - Update domain settings
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    // Whitelist allowed fields — reject unknown fields like custom_css to prevent injection
    const ALLOWED_FIELDS = ['isDefault', 'redirectHttps', 'sslStatus', 'metadata'];
    const unknownFields = Object.keys(req.body).filter(k => !ALLOWED_FIELDS.includes(k));
    if (unknownFields.length > 0) {
      return res.status(400).json({ 
        error: `Unknown fields not allowed: ${unknownFields.join(', ')}` 
      });
    }

    const { isDefault, redirectHttps, sslStatus, metadata } = req.body;

    // Validate sslStatus if provided
    const VALID_SSL_STATUSES = ['pending', 'active', 'failed'];
    if (sslStatus && !VALID_SSL_STATUSES.includes(sslStatus)) {
      return res.status(400).json({ error: `Invalid sslStatus. Must be one of: ${VALID_SSL_STATUSES.join(', ')}` });
    }

    const customDomain = await prisma.customDomain.findFirst({
      where: { id, userId }
    });

    if (!customDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.customDomain.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Sanitize metadata to strip CSS/script injection keys
    const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : undefined;

    const updated = await prisma.customDomain.update({
      where: { id },
      data: {
        ...(typeof isDefault === 'boolean' && { isDefault }),
        ...(typeof redirectHttps === 'boolean' && { redirectHttps }),
        ...(sslStatus && { sslStatus }),
        ...(sanitizedMetadata !== undefined && { metadata: sanitizedMetadata })
      }
    });

    res.json({ domain: updated });

  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ error: 'Failed to update domain' });
  }
});

/**
 * DELETE /api/domains/:id - Remove custom domain
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const customDomain = await prisma.customDomain.findFirst({
      where: { id, userId }
    });

    if (!customDomain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Check if domain has active links
    const linkCount = await prisma.link.count({
      where: { domainId: id }
    });

    if (linkCount > 0) {
      return res.status(400).json({
        error: `Cannot delete domain with ${linkCount} active links. Please reassign or delete the links first.`
      });
    }

    await prisma.customDomain.delete({ where: { id } });

    res.json({ message: 'Domain deleted successfully' });

  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ error: 'Failed to delete domain' });
  }
});

/**
 * Verify DNS records for a domain
 */
async function verifyDNSRecords(domain, expectedToken) {
  try {
    // Check 1: TXT record for verification token
    const txtRecords = await dns.resolveTxt(`_linkforge-verify.${domain}`).catch(() => []);
    const verificationTxtFound = txtRecords.some(record => 
      record.join('').includes(expectedToken)
    );

    if (!verificationTxtFound) {
      return {
        success: false,
        error: 'DNS verification TXT record not found',
        details: `Expected TXT record at _linkforge-verify.${domain} with value: linkforge-verify=${expectedToken}`
      };
    }

    // Check 2: A or CNAME record pointing to our server
    const serverIp = process.env.SERVER_IP || 'YOUR_SERVER_IP';
    const serverDomain = process.env.SERVER_DOMAIN || 'linkforge.app';

    let aRecords = [];
    let cnameRecords = [];

    try {
      aRecords = await dns.resolve4(domain);
    } catch (e) {
      // A record not found, check CNAME
      try {
        cnameRecords = await dns.resolveCname(domain);
      } catch (e2) {
        return {
          success: false,
          error: 'Neither A nor CNAME record found',
          details: `Domain must have either:\n- A record pointing to ${serverIp}\n- CNAME record pointing to ${serverDomain}`
        };
      }
    }

    const hasValidARecord = aRecords.includes(serverIp);
    const hasValidCNAME = cnameRecords.some(record => record.includes(serverDomain));

    if (!hasValidARecord && !hasValidCNAME) {
      return {
        success: false,
        error: 'Domain not pointing to LinkForge servers',
        details: `Found:\nA records: ${aRecords.join(', ') || 'none'}\nCNAME records: ${cnameRecords.join(', ') || 'none'}\n\nExpected:\n- A record: ${serverIp}\n- OR CNAME: ${serverDomain}`
      };
    }

    return { success: true };

  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      success: false,
      error: 'DNS lookup failed',
      details: error.message
    };
  }
}

/**
 * Generate DNS setup instructions
 */
function generateDNSInstructions(domain, verificationToken) {
  const serverIp = process.env.SERVER_IP || 'YOUR_SERVER_IP';
  const serverDomain = process.env.SERVER_DOMAIN || 'linkforge.app';

  return {
    step1: {
      title: 'Add DNS Records',
      description: 'Add the following DNS records to your domain provider (GoDaddy, Cloudflare, Namecheap, etc.)',
      records: [
        {
          type: 'TXT',
          name: `_linkforge-verify.${domain}`,
          value: `linkforge-verify=${verificationToken}`,
          ttl: 3600,
          purpose: 'Domain ownership verification'
        },
        {
          type: 'A',
          name: domain,
          value: serverIp,
          ttl: 3600,
          purpose: 'Point domain to LinkForge servers'
        }
      ],
      alternative: {
        description: 'Instead of an A record, you can use a CNAME (recommended if using CDN)',
        record: {
          type: 'CNAME',
          name: domain,
          value: serverDomain,
          ttl: 3600
        }
      }
    },
    step2: {
      title: 'Wait for DNS Propagation',
      description: 'DNS changes can take 1-48 hours to propagate globally. Typically it takes 5-30 minutes.',
      checkTools: [
        `https://dnschecker.org/#TXT/_linkforge-verify.${domain}`,
        `https://dnschecker.org/#A/${domain}`
      ]
    },
    step3: {
      title: 'Verify Domain',
      description: 'Once DNS records are propagated, click the "Verify Domain" button to complete setup.'
    }
  };
}

/**
 * Generate SSL/HTTPS setup instructions
 */
function generateSSLInstructions(domain) {
  return {
    title: 'SSL Certificate Setup',
    description: 'To enable HTTPS for your custom domain, follow one of these options:',
    options: [
      {
        name: 'Cloudflare (Recommended - Free)',
        steps: [
          '1. Sign up for Cloudflare (free plan available)',
          '2. Add your root domain to Cloudflare',
          '3. Update nameservers at your domain registrar',
          '4. Enable "SSL/TLS" → "Full (strict)" mode',
          '5. Cloudflare will automatically provision SSL certificate',
          '6. Wait 10-15 minutes for certificate activation'
        ],
        pros: ['Free', 'Automatic renewal', 'CDN included', 'DDoS protection'],
        link: 'https://cloudflare.com'
      },
      {
        name: "Let's Encrypt (Advanced)",
        steps: [
          '1. SSH into your LinkForge server',
          '2. Install certbot: `sudo apt install certbot python3-certbot-nginx`',
          `3. Run: sudo certbot --nginx -d ${domain}`,
          '4. Follow prompts to obtain certificate',
          '5. Certbot will auto-renew every 90 days'
        ],
        pros: ['Free', 'Direct control', 'Auto-renewal'],
        link: 'https://letsencrypt.org'
      },
      {
        name: 'Manual Certificate (Advanced)',
        steps: [
          '1. Purchase SSL certificate from provider (DigiCert, Comodo, etc.)',
          '2. Generate CSR on your server',
          '3. Upload certificate to server',
          '4. Configure Nginx/Apache with certificate',
          '5. Set up renewal process'
        ],
        pros: ['Full control', 'Extended validation available'],
        link: null
      }
    ],
    note: 'Once SSL is active, update the "SSL Status" in domain settings to enable HTTPS redirects.'
  };
}

module.exports = router;
