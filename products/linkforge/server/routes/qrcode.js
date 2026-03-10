/**
 * QR Code Generation API
 * Task #10313 - Implement QR code generation for short links
 * 
 * Generate QR codes for short links in PNG or SVG format
 */

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

/**
 * GET /api/qrcode/:slug
 * Generate QR code for a short link
 * 
 * Query params:
 * - format: 'png' (default) or 'svg'
 * - size: number (default 300, max 2000)
 * - margin: number (default 4)
 * - color: hex color for dark modules (default #000000)
 * - bgcolor: hex color for light modules (default #ffffff)
 * - download: '1' to force download, '0' to display inline (default '0')
 */
router.get('/:slug', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { slug } = req.params;
    const {
      format = 'png',
      size = 300,
      margin = 4,
      color = '#000000',
      bgcolor = '#ffffff',
      download = '0'
    } = req.query;

    // Validate format
    if (!['png', 'svg'].includes(format)) {
      return res.status(400).json({ 
        error: 'Invalid format. Use "png" or "svg"' 
      });
    }

    // Validate size
    const sizeNum = parseInt(size);
    if (isNaN(sizeNum) || sizeNum < 50 || sizeNum > 2000) {
      return res.status(400).json({ 
        error: 'Size must be between 50 and 2000 pixels' 
      });
    }

    // Validate margin
    const marginNum = parseInt(margin);
    if (isNaN(marginNum) || marginNum < 0 || marginNum > 10) {
      return res.status(400).json({ 
        error: 'Margin must be between 0 and 10' 
      });
    }

    // Find link by slug
    const link = await prisma.link.findFirst({
      where: { slug },
      include: {
        customDomain: {
          select: {
            domain: true,
            sslStatus: true
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found',
        slug 
      });
    }

    // Generate full short URL
    const protocol = link.customDomain?.sslStatus === 'active' ? 'https' : 'http';
    const domain = link.customDomain?.domain || 
                   process.env.PRIMARY_DOMAIN || 
                   req.get('host');
    const shortUrl = `${protocol}://${domain}/${slug}`;

    // QR code options
    const qrOptions = {
      errorCorrectionLevel: 'M',
      margin: marginNum,
      color: {
        dark: color,
        light: bgcolor
      }
    };

    // Generate QR code based on format
    if (format === 'svg') {
      // Generate SVG
      const svgString = await QRCode.toString(shortUrl, {
        ...qrOptions,
        type: 'svg',
        width: sizeNum
      });

      // Set headers
      res.type('image/svg+xml');
      if (download === '1') {
        res.setHeader('Content-Disposition', `attachment; filename="qr-${slug}.svg"`);
      } else {
        res.setHeader('Content-Disposition', 'inline');
      }
      
      res.send(svgString);

    } else {
      // Generate PNG
      const buffer = await QRCode.toBuffer(shortUrl, {
        ...qrOptions,
        type: 'png',
        width: sizeNum
      });

      // Set headers
      res.type('image/png');
      if (download === '1') {
        res.setHeader('Content-Disposition', `attachment; filename="qr-${slug}.png"`);
      } else {
        res.setHeader('Content-Disposition', 'inline');
      }
      
      res.send(buffer);
    }

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate QR code',
      message: error.message 
    });
  }
});

/**
 * GET /api/qrcode/preview/:slug
 * Generate QR code preview as data URL (for embedding in HTML)
 * Returns JSON with data URL
 */
router.get('/preview/:slug', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const { slug } = req.params;
    const {
      size = 300,
      margin = 4,
      color = '#000000',
      bgcolor = '#ffffff'
    } = req.query;

    // Validate inputs
    const sizeNum = parseInt(size);
    const marginNum = parseInt(margin);

    if (isNaN(sizeNum) || sizeNum < 50 || sizeNum > 2000) {
      return res.status(400).json({ 
        error: 'Size must be between 50 and 2000 pixels' 
      });
    }

    // Find link
    const link = await prisma.link.findFirst({
      where: { slug },
      include: {
        customDomain: {
          select: {
            domain: true,
            sslStatus: true
          }
        }
      }
    });

    if (!link) {
      return res.status(404).json({ 
        error: 'Link not found',
        slug 
      });
    }

    // Generate full short URL
    const protocol = link.customDomain?.sslStatus === 'active' ? 'https' : 'http';
    const domain = link.customDomain?.domain || 
                   process.env.PRIMARY_DOMAIN || 
                   req.get('host');
    const shortUrl = `${protocol}://${domain}/${slug}`;

    // Generate data URL
    const dataUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'M',
      margin: marginNum,
      width: sizeNum,
      color: {
        dark: color,
        light: bgcolor
      }
    });

    res.json({
      slug,
      shortUrl,
      qrCode: dataUrl,
      size: sizeNum,
      format: 'png'
    });

  } catch (error) {
    console.error('QR code preview error:', error);
    res.status(500).json({ 
      error: 'Failed to generate QR code preview',
      message: error.message 
    });
  }
});

/**
 * POST /api/qrcode/batch
 * Generate QR codes for multiple links
 * Returns array of data URLs
 * 
 * Body: {
 *   slugs: string[],
 *   size?: number,
 *   margin?: number,
 *   color?: string,
 *   bgcolor?: string
 * }
 */
router.post('/batch', async (req, res) => {
  const prisma = req.app.locals.prisma;
  
  try {
    const {
      slugs,
      size = 300,
      margin = 4,
      color = '#000000',
      bgcolor = '#ffffff'
    } = req.body;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return res.status(400).json({ 
        error: 'slugs must be a non-empty array' 
      });
    }

    if (slugs.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 slugs per request' 
      });
    }

    // Validate size
    const sizeNum = parseInt(size);
    const marginNum = parseInt(margin);

    if (isNaN(sizeNum) || sizeNum < 50 || sizeNum > 2000) {
      return res.status(400).json({ 
        error: 'Size must be between 50 and 2000 pixels' 
      });
    }

    // Find all links
    const links = await prisma.link.findMany({
      where: {
        slug: { in: slugs }
      },
      include: {
        customDomain: {
          select: {
            domain: true,
            sslStatus: true
          }
        }
      }
    });

    // Generate QR codes for found links
    const results = await Promise.all(
      links.map(async (link) => {
        const protocol = link.customDomain?.sslStatus === 'active' ? 'https' : 'http';
        const domain = link.customDomain?.domain || 
                       process.env.PRIMARY_DOMAIN || 
                       'linkforge.app';
        const shortUrl = `${protocol}://${domain}/${link.slug}`;

        const dataUrl = await QRCode.toDataURL(shortUrl, {
          errorCorrectionLevel: 'M',
          margin: marginNum,
          width: sizeNum,
          color: {
            dark: color,
            light: bgcolor
          }
        });

        return {
          slug: link.slug,
          shortUrl,
          qrCode: dataUrl
        };
      })
    );

    // Find missing slugs
    const foundSlugs = links.map(l => l.slug);
    const missingSlugs = slugs.filter(s => !foundSlugs.includes(s));

    res.json({
      success: true,
      generated: results.length,
      results,
      missing: missingSlugs
    });

  } catch (error) {
    console.error('Batch QR code generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate QR codes',
      message: error.message 
    });
  }
});

module.exports = router;
