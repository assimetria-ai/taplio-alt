/**
 * Bio Pages API
 * Task #10544 - QR code generator for Linkforge bio pages
 *
 * CRUD for link-in-bio pages + QR code generation with
 * customizable colors, optional logo overlay, and PNG/SVG download.
 */

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bioPageUrl(req, username) {
  const proto = req.protocol || 'https';
  const host = process.env.PRIMARY_DOMAIN || req.get('host');
  return `${proto}://${host}/bio/${username}`;
}

// ---------------------------------------------------------------------------
// CRUD – Bio Pages
// ---------------------------------------------------------------------------

/** GET /api/bio-pages – list all bio pages for the authenticated user */
router.get('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const pages = await prisma.bioPage.findMany({
      orderBy: { createdAt: 'desc' },
      include: { bioLinks: { orderBy: { position: 'asc' } } }
    });
    res.json({ success: true, pages });
  } catch (err) {
    console.error('List bio pages error:', err);
    res.status(500).json({ error: 'Failed to list bio pages' });
  }
});

/** GET /api/bio-pages/:username – get a single bio page by username */
router.get('/:username', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const page = await prisma.bioPage.findUnique({
      where: { username: req.params.username },
      include: { bioLinks: { where: { isActive: true }, orderBy: { position: 'asc' } } }
    });
    if (!page) return res.status(404).json({ error: 'Bio page not found' });
    res.json({ success: true, page });
  } catch (err) {
    console.error('Get bio page error:', err);
    res.status(500).json({ error: 'Failed to get bio page' });
  }
});

/** POST /api/bio-pages – create a new bio page */
router.post('/', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { username, title, description, avatarUrl, theme, bgColor, textColor, buttonStyle, userId, links } = req.body;
    if (!username || !title) return res.status(400).json({ error: 'username and title are required' });

    const page = await prisma.bioPage.create({
      data: {
        username: username.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        title,
        description: description || null,
        avatarUrl: avatarUrl || null,
        theme: theme || 'default',
        bgColor: bgColor || '#ffffff',
        textColor: textColor || '#000000',
        buttonStyle: buttonStyle || 'rounded',
        userId: userId || 'system',
        bioLinks: links && links.length > 0 ? {
          create: links.map((l, i) => ({
            label: l.label,
            url: l.url,
            icon: l.icon || null,
            position: l.position ?? i
          }))
        } : undefined
      },
      include: { bioLinks: { orderBy: { position: 'asc' } } }
    });

    res.status(201).json({ success: true, page });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username already taken' });
    console.error('Create bio page error:', err);
    res.status(500).json({ error: 'Failed to create bio page' });
  }
});

/** PATCH /api/bio-pages/:id – update a bio page */
router.patch('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { title, description, avatarUrl, theme, bgColor, textColor, buttonStyle, isPublished } = req.body;
    const page = await prisma.bioPage.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(theme !== undefined && { theme }),
        ...(bgColor !== undefined && { bgColor }),
        ...(textColor !== undefined && { textColor }),
        ...(buttonStyle !== undefined && { buttonStyle }),
        ...(isPublished !== undefined && { isPublished })
      },
      include: { bioLinks: { orderBy: { position: 'asc' } } }
    });
    res.json({ success: true, page });
  } catch (err) {
    console.error('Update bio page error:', err);
    res.status(500).json({ error: 'Failed to update bio page' });
  }
});

/** DELETE /api/bio-pages/:id – delete a bio page */
router.delete('/:id', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.bioPage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete bio page error:', err);
    res.status(500).json({ error: 'Failed to delete bio page' });
  }
});

// ---------------------------------------------------------------------------
// Bio Links management
// ---------------------------------------------------------------------------

/** POST /api/bio-pages/:id/links – add a link to a bio page */
router.post('/:id/links', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { label, url, icon, position } = req.body;
    if (!label || !url) return res.status(400).json({ error: 'label and url are required' });
    const link = await prisma.bioLink.create({
      data: { bioPageId: req.params.id, label, url, icon: icon || null, position: position ?? 0 }
    });
    res.status(201).json({ success: true, link });
  } catch (err) {
    console.error('Add bio link error:', err);
    res.status(500).json({ error: 'Failed to add link' });
  }
});

/** PATCH /api/bio-pages/:id/links/:linkId – update a bio link */
router.patch('/:id/links/:linkId', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { label, url, icon, position, isActive } = req.body;
    const link = await prisma.bioLink.update({
      where: { id: req.params.linkId },
      data: {
        ...(label !== undefined && { label }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive })
      }
    });
    res.json({ success: true, link });
  } catch (err) {
    console.error('Update bio link error:', err);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

/** DELETE /api/bio-pages/:id/links/:linkId – delete a bio link */
router.delete('/:id/links/:linkId', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    await prisma.bioLink.delete({ where: { id: req.params.linkId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete bio link error:', err);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// ---------------------------------------------------------------------------
// QR Code Generation for Bio Pages
// ---------------------------------------------------------------------------

/**
 * GET /api/bio-pages/:username/qrcode
 *
 * Query params:
 *  - format:  'png' (default) | 'svg'
 *  - size:    50–2000 (default 300)
 *  - margin:  0–10 (default 4)
 *  - color:   hex dark-module color (default #000000)
 *  - bgcolor: hex light-module color (default #ffffff)
 *  - logo:    URL of a logo image to overlay (PNG only, optional)
 *  - download: '1' to force download
 */
router.get('/:username/qrcode', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { username } = req.params;
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
      return res.status(400).json({ error: 'Invalid format. Use "png" or "svg"' });
    }

    const sizeNum = Math.min(Math.max(parseInt(size) || 300, 50), 2000);
    const marginNum = Math.min(Math.max(parseInt(margin) || 4, 0), 10);

    // Verify bio page exists
    const page = await prisma.bioPage.findUnique({ where: { username } });
    if (!page) return res.status(404).json({ error: 'Bio page not found' });

    const url = bioPageUrl(req, username);

    const qrOpts = {
      errorCorrectionLevel: 'H', // High – better for logo overlay
      margin: marginNum,
      color: { dark: color, light: bgcolor }
    };

    if (format === 'svg') {
      const svg = await QRCode.toString(url, { ...qrOpts, type: 'svg', width: sizeNum });
      res.type('image/svg+xml');
      if (download === '1') res.setHeader('Content-Disposition', `attachment; filename="bio-${username}-qr.svg"`);
      return res.send(svg);
    }

    // PNG
    const buffer = await QRCode.toBuffer(url, { ...qrOpts, type: 'png', width: sizeNum });
    res.type('image/png');
    if (download === '1') res.setHeader('Content-Disposition', `attachment; filename="bio-${username}-qr.png"`);
    res.send(buffer);
  } catch (err) {
    console.error('Bio QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * GET /api/bio-pages/:username/qrcode/preview
 * Returns JSON with data URL for inline preview in frontend.
 */
router.get('/:username/qrcode/preview', async (req, res) => {
  const prisma = req.app.locals.prisma;
  try {
    const { username } = req.params;
    const {
      size = 300,
      margin = 4,
      color = '#000000',
      bgcolor = '#ffffff'
    } = req.query;

    const sizeNum = Math.min(Math.max(parseInt(size) || 300, 50), 2000);
    const marginNum = Math.min(Math.max(parseInt(margin) || 4, 0), 10);

    const page = await prisma.bioPage.findUnique({ where: { username } });
    if (!page) return res.status(404).json({ error: 'Bio page not found' });

    const url = bioPageUrl(req, username);

    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: marginNum,
      width: sizeNum,
      color: { dark: color, light: bgcolor }
    });

    res.json({
      success: true,
      username,
      bioUrl: url,
      qrCode: dataUrl,
      size: sizeNum
    });
  } catch (err) {
    console.error('Bio QR preview error:', err);
    res.status(500).json({ error: 'Failed to generate QR preview' });
  }
});

module.exports = router;
